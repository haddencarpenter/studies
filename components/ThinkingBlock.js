import { useState } from 'react';
import { Collapse, Timeline } from 'antd';
import { 
  BulbOutlined, 
  LoadingOutlined, 
  CheckCircleOutlined,
  DownOutlined 
} from '@ant-design/icons';
import shumiStyles from '../styles/shumi.module.less';

const { Panel } = Collapse;

/**
 * ThinkingBlock - Displays AI's reasoning process
 * 
 * @param {Array} thinking - Array of thinking steps
 * @param {boolean} isStreaming - Whether AI is currently thinking
 * 
 * Example thinking format:
 * [
 *   {
 *     step: 1,
 *     title: "Fetching Solana ecosystem coins",
 *     description: "Retrieved 247 coins from CoinGecko API",
 *     status: "complete",
 *     duration: 342
 *   },
 *   ...
 * ]
 */
const ThinkingBlock = ({ thinking = [], isStreaming = false }) => {
  const [expanded, setExpanded] = useState(false);
  
  if (!thinking || thinking.length === 0) return null;
  
  const completedSteps = thinking.filter(t => t.status === 'complete').length;
  const totalSteps = thinking.length;
  
  return (
    <div className={shumiStyles.thinkingBlock}>
      <Collapse 
        ghost
        activeKey={expanded ? ['1'] : []}
        onChange={() => setExpanded(!expanded)}
        expandIcon={({ isActive }) => (
          <DownOutlined 
            className={shumiStyles.expandIcon}
            style={{ 
              transform: `rotate(${isActive ? 180 : 0}deg)`,
              transition: 'transform 0.3s'
            }} 
          />
        )}
      >
        <Panel
          header={
            <div className={shumiStyles.thinkingHeader}>
              {isStreaming ? (
                <LoadingOutlined className={shumiStyles.thinkingIcon} />
              ) : (
                <BulbOutlined className={shumiStyles.thinkingIcon} />
              )}
              <span className={shumiStyles.thinkingTitle}>
                {isStreaming ? 'Thinking...' : 'Thought Process'}
              </span>
              <span className={shumiStyles.stepCount}>
                {completedSteps}/{totalSteps} steps
              </span>
            </div>
          }
          key="1"
          className={shumiStyles.thinkingPanel}
        >
          <Timeline
            pending={isStreaming}
            className={shumiStyles.timeline}
          >
            {thinking.map((step, index) => (
              <Timeline.Item
                key={index}
                dot={
                  step.status === 'complete' ? (
                    <CheckCircleOutlined 
                      style={{ 
                        color: 'var(--cr-success-color)',
                        fontSize: '14px'
                      }} 
                    />
                  ) : (
                    <LoadingOutlined style={{ fontSize: '14px' }} />
                  )
                }
              >
                <div className={shumiStyles.timelineItem}>
                  <div className={shumiStyles.stepTitle}>{step.title}</div>
                  {step.description && (
                    <div className={shumiStyles.stepDescription}>
                      {step.description}
                    </div>
                  )}
                  {step.duration && (
                    <div className={shumiStyles.duration}>
                      {step.duration}ms
                    </div>
                  )}
                </div>
              </Timeline.Item>
            ))}
          </Timeline>
        </Panel>
      </Collapse>
    </div>
  );
};

export default ThinkingBlock;

