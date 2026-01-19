import { Langfuse } from 'langfuse';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

// Initialize Langfuse client (reads from env vars: LANGFUSE_SECRET_KEY, LANGFUSE_PUBLIC_KEY, LANGFUSE_HOST)
const langfuse = new Langfuse();

/**
 * Fetch all traces from Langfuse using the REST API
 * Langfuse API uses Basic Auth with publicKey:secretKey
 */
async function fetchAllUserTraces() {
  const allTraces = [];
  let page = 1;
  const pageSize = 50;
  let hasMore = true;

  const publicKey = process.env.LANGFUSE_PUBLIC_KEY;
  const secretKey = process.env.LANGFUSE_SECRET_KEY;
  const baseUrl = process.env.LANGFUSE_HOST || 'https://cloud.langfuse.com';

  if (!publicKey || !secretKey) {
    throw new Error('LANGFUSE_PUBLIC_KEY and LANGFUSE_SECRET_KEY environment variables are required');
  }

  // Create Basic Auth header
  const auth = Buffer.from(`${publicKey}:${secretKey}`).toString('base64');

  console.log('Fetching traces from Langfuse...');
  console.log(`Base URL: ${baseUrl}`);

  while (hasMore) {
    try {
      // Langfuse REST API endpoint for traces
      const url = `${baseUrl}/api/public/traces?page=${page}&limit=${pageSize}`;

      const response = await fetch(url, {
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch traces: ${response.status} ${response.statusText}\n${errorText}`);
      }

      const data = await response.json();

      // Handle different response formats
      let traces = [];
      if (Array.isArray(data)) {
        traces = data;
      } else if (data.data && Array.isArray(data.data)) {
        traces = data.data;
      } else if (data.traces && Array.isArray(data.traces)) {
        traces = data.traces;
      }

      if (traces.length === 0) {
        hasMore = false;
        break;
      }

      allTraces.push(...traces);
      console.log(`Fetched page ${page}: ${traces.length} traces (total: ${allTraces.length})`);

      // Check if there are more pages
      // Langfuse API typically returns pagination info in the response
      if (data.pagination) {
        hasMore = data.pagination.hasNextPage !== false && traces.length === pageSize;
      } else {
        hasMore = traces.length === pageSize;
      }

      // Add a small delay between requests to avoid rate limiting/timeouts
      if (hasMore) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      page++;
    } catch (error) {
      console.error(`Error fetching page ${page}:`, error.message);
      // If it's a timeout (524), wait longer and retry
      if (error.message.includes('524') || error.message.includes('timeout')) {
        console.log('Timeout detected, waiting 5 seconds before retrying...');
        await new Promise(resolve => setTimeout(resolve, 5000));
        // Don't break, continue to next page
      } else {
        hasMore = false;
      }
    }
  }

  return allTraces;
}

/**
 * Extract user inputs from traces
 * Langfuse traces can have user inputs in various places:
 * - trace.input (direct input)
 * - trace.metadata (metadata fields)
 * - observations (nested spans/generations)
 * - messages array (if using chat format)
 */
function extractUserInputs(traces) {
  const userInputs = [];

  // Patterns to filter out (system prompts, classification prompts, etc.)
  const systemPromptPatterns = [
    /^Evaluate the Input based on the criteria/i,
    /^You are.*(?:Shumi|AI|assistant|classifier)/i,
    /^Analyze this crypto-related query/i,
    /^#.*PROMPT/i,
    /^CLASSIFICATION PROMPT/i,
    /^SYSTEM PROMPT/i,
    /truncated due to size/i
  ];

  function isSystemPrompt(text) {
    if (!text || typeof text !== 'string') return true;
    return systemPromptPatterns.some(pattern => pattern.test(text));
  }

  function extractFromJsonString(jsonStr) {
    try {
      const parsed = JSON.parse(jsonStr);

      // Check if it's a messages array
      if (Array.isArray(parsed)) {
        // Look for user messages
        for (const msg of parsed) {
          if (msg.role === 'user' || msg.type === 'user') {
            if (typeof msg.content === 'string' && !isSystemPrompt(msg.content)) {
              return msg.content;
            }
          }
        }
      } else if (parsed.messages && Array.isArray(parsed.messages)) {
        // Look for user messages in messages array
        for (const msg of parsed.messages) {
          if (msg.role === 'user' || msg.type === 'user') {
            if (typeof msg.content === 'string' && !isSystemPrompt(msg.content)) {
              return msg.content;
            }
          }
        }
      } else if (parsed.query) {
        // Direct query field
        if (typeof parsed.query === 'string' && !isSystemPrompt(parsed.query)) {
          return parsed.query;
        }
      } else if (parsed.text) {
        // Text field
        if (typeof parsed.text === 'string' && !isSystemPrompt(parsed.text)) {
          return parsed.text;
        }
      }

      // Look for "Last user prompt" pattern in stringified JSON
      const jsonStrLower = jsonStr.toLowerCase();
      const lastPromptMatch = jsonStr.match(/"last\s+user\s+prompt":\s*"([^"]+)"/i);
      if (lastPromptMatch && lastPromptMatch[1]) {
        const prompt = lastPromptMatch[1].replace(/\\n/g, ' ').replace(/\\"/g, '"');
        if (!isSystemPrompt(prompt)) {
          return prompt;
        }
      }
    } catch (e) {
      // Not valid JSON, continue
    }
    return null;
  }

  for (const trace of traces) {
    let userInput = null;
    let source = 'unknown';

    // Strategy 1: Check trace.input field directly
    if (trace.input) {
      if (typeof trace.input === 'string') {
        // Check if it's JSON
        if (trace.input.trim().startsWith('{') || trace.input.trim().startsWith('[')) {
          const extracted = extractFromJsonString(trace.input);
          if (extracted) {
            userInput = extracted;
            source = 'trace.input[json]';
          }
        } else if (!isSystemPrompt(trace.input)) {
          userInput = trace.input;
          source = 'trace.input';
        }
      } else if (Array.isArray(trace.input)) {
        // Chat format: look for user messages
        const userMessage = trace.input.find(msg => msg.role === 'user' || msg.type === 'user');
        if (userMessage) {
          const content = typeof userMessage.content === 'string'
            ? userMessage.content
            : JSON.stringify(userMessage.content);
          if (!isSystemPrompt(content)) {
            userInput = content;
            source = 'trace.input[messages]';
          }
        }
      } else if (typeof trace.input === 'object') {
        // Try to find a text/content/query field
        const possibleInput = trace.input.text || trace.input.content || trace.input.query;
        if (possibleInput) {
          const content = typeof possibleInput === 'string' ? possibleInput : JSON.stringify(possibleInput);
          if (!isSystemPrompt(content)) {
            userInput = content;
            source = 'trace.input[object]';
          }
        } else {
          // Try parsing as JSON string
          const jsonStr = JSON.stringify(trace.input);
          const extracted = extractFromJsonString(jsonStr);
          if (extracted) {
            userInput = extracted;
            source = 'trace.input[object->json]';
          }
        }
      }
    }

    // Strategy 2: Check trace metadata
    if (!userInput && trace.metadata) {
      // Check for user message fields
      const metadataFields = ['userMessage', 'message', 'query', 'input', 'user_query', 'userQuery'];
      for (const field of metadataFields) {
        if (trace.metadata[field]) {
          const content = typeof trace.metadata[field] === 'string'
            ? trace.metadata[field]
            : JSON.stringify(trace.metadata[field]);

          // Check if it's JSON
          if (content.trim().startsWith('{') || content.trim().startsWith('[')) {
            const extracted = extractFromJsonString(content);
            if (extracted) {
              userInput = extracted;
              source = `trace.metadata.${field}[json]`;
              break;
            }
          } else if (!isSystemPrompt(content)) {
            userInput = content;
            source = `trace.metadata.${field}`;
            break;
          }
        }
      }
    }

    // Strategy 3: Check trace name (sometimes contains the query)
    if (!userInput && trace.name) {
      // If name looks like a user query (not a system name), use it
      const name = trace.name.toLowerCase();
      if (name.length > 10 &&
          !name.includes('trace') &&
          !name.includes('span') &&
          !name.includes('generation') &&
          !name.includes('classification') &&
          !name.includes('evaluate') &&
          !isSystemPrompt(trace.name)) {
        userInput = trace.name;
        source = 'trace.name';
      }
    }

    // Strategy 4: Check observations (need to fetch full trace details)
    // Note: This would require additional API calls to get observation details
    // For now, we'll skip this and focus on trace-level data

    if (userInput && userInput.trim().length > 0 && !isSystemPrompt(userInput)) {
      userInputs.push({
        traceId: trace.id,
        userId: trace.userId || 'anonymous',
        sessionId: trace.sessionId || null,
        timestamp: trace.timestamp || trace.createdAt || trace.created_at,
        input: userInput.trim(),
        name: trace.name || null,
        tags: trace.tags || [],
        metadata: trace.metadata || {},
        source: source
      });
    }
  }

  return userInputs;
}

/**
 * Categorize user inputs based on crypto trading patterns
 */
function categorizeInputs(userInputs) {
  const categories = {
    'Coin Information': [],
    'Trend Analysis': [],
    'Category Query': [],
    'Market Health': [],
    'Sentiment Analysis': [],
    'Delta Neutral / Trading': [],
    'Comparison': [],
    'Top/Best Coins': [],
    'General Question': [],
    'Other': []
  };

  for (const input of userInputs) {
    const text = input.input.toLowerCase();
    let categorized = false;

    // Delta neutral / trading (highest priority - very specific)
    if (text.match(/\b(delta.?neutral|funding.?rate|airdrop|perp|perpetual|funding|long.*short|hedge)\b/)) {
      categories['Delta Neutral / Trading'].push(input);
      categorized = true;
    }

    // Top/Best coins queries
    if (!categorized && text.match(/\b(top|best|largest|biggest|highest|show me|list|find).*\b(coin|token|crypto)\b/)) {
      categories['Top/Best Coins'].push(input);
      categorized = true;
    }

    // Category queries (check before coin info to catch "show me defi coins")
    if (!categorized && text.match(/\b(category|categories|defi|ai|meme|layer|ecosystem|zk|depin|rwa|gaming|nft|oracle|wallet|infrastructure)\b/)) {
      if (text.match(/\b(show|top|best|list|find|what).*\b(category|categories|defi|ai|meme|layer|ecosystem)\b/)) {
        categories['Category Query'].push(input);
        categorized = true;
      }
    }

    // Trend analysis (specific coin trends)
    if (!categorized && text.match(/\b(trend|trends|analysis|signal|streak|up|down|hodl|chart|price.*movement)\b/)) {
      if (text.match(/\b(btc|eth|sol|bitcoin|ethereum|solana|[\$]?[A-Z]{2,5})\b/)) {
        categories['Trend Analysis'].push(input);
        categorized = true;
      }
    }

    // Market health (overall market queries)
    if (!categorized && text.match(/\b(market.?health|market.?sentiment|overall.?market|market.?status|market.?condition|how.*market)\b/)) {
      categories['Market Health'].push(input);
      categorized = true;
    }

    // Sentiment (specific sentiment queries)
    if (!categorized && text.match(/\b(sentiment|feeling|mood|bullish|bearish|fear|greed|emotion)\b/)) {
      categories['Sentiment Analysis'].push(input);
      categorized = true;
    }

    // Coin information (general coin queries)
    if (!categorized && text.match(/\b(btc|eth|sol|bitcoin|ethereum|solana|[\$]?[A-Z]{2,5})\b/)) {
      if (text.match(/\b(what|tell me|info|about|show|tell|explain|details)\b/)) {
        categories['Coin Information'].push(input);
        categorized = true;
      }
    }

    // Comparison queries
    if (!categorized && text.match(/\b(vs|versus|compare|comparison|better|worse|difference|between|versus)\b/)) {
      categories['Comparison'].push(input);
      categorized = true;
    }

    // General questions (catch-all for questions)
    if (!categorized && text.match(/\b(how|why|when|where|explain|help|what is|what are|can you|tell me)\b/)) {
      categories['General Question'].push(input);
      categorized = true;
    }

    // If still not categorized, check if it's crypto-related
    if (!categorized) {
      if (text.match(/\b(crypto|coin|token|blockchain|defi|nft|bitcoin|ethereum|solana|trading|market)\b/)) {
        categories['Other'].push(input);
      } else {
        categories['Other'].push(input);
      }
    }
  }

  return categories;
}

/**
 * Main function
 */
async function main() {
  try {
    console.log('Starting to fetch Langfuse traces...\n');

    // Fetch all traces
    const traces = await fetchAllUserTraces();
    console.log(`\nTotal traces fetched: ${traces.length}\n`);

    // Extract user inputs
    const userInputs = extractUserInputs(traces);
    console.log(`Total user inputs extracted: ${userInputs.length}\n`);

    // Categorize inputs
    const categories = categorizeInputs(userInputs);

    // Display results
    console.log('=== CATEGORIZED USER INPUTS ===\n');
    for (const [category, inputs] of Object.entries(categories)) {
      console.log(`\n${category}: ${inputs.length} inputs`);
      if (inputs.length > 0) {
        console.log('Sample inputs:');
        inputs.slice(0, 5).forEach((input, idx) => {
          console.log(`  ${idx + 1}. ${input.input.substring(0, 100)}${input.input.length > 100 ? '...' : ''}`);
        });
        if (inputs.length > 5) {
          console.log(`  ... and ${inputs.length - 5} more`);
        }
      }
    }

    // Save to file
    const output = {
      summary: {
        totalTraces: traces.length,
        totalUserInputs: userInputs.length,
        categories: Object.fromEntries(
          Object.entries(categories).map(([cat, inputs]) => [cat, inputs.length])
        )
      },
      categories: categories,
      allInputs: userInputs
    };

    const outputFile = 'langfuse-user-inputs.json';
    const outputPath = `${process.cwd()}/${outputFile}`;
    fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));
    console.log(`\n\nResults saved to ${outputPath}`);

  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();

