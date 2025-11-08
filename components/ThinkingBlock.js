import { useState, useEffect } from 'react';
import { Card, Space, Progress } from 'antd';
import shumiStyles from '../styles/shumi.module.less';

/**
 * ShumiThoughtProcess - Crypto-native thinking display with animated progress
 * 
 * @param {Array} thinking - Array of thinking steps
 * @param {boolean} isStreaming - Whether AI is currently thinking
 */
const ThinkingBlock = ({ thinking = [], isStreaming = false }) => {
  const [currentProgress, setCurrentProgress] = useState(0);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  
  if (!thinking || thinking.length === 0) return null;
  
  // Animate progress while streaming - syncs with response arrival
  useEffect(() => {
    if (!isStreaming) {
      // When streaming stops, jump to 100% and component will disappear
      setCurrentProgress(100);
      return;
    }
    
    // Start from 5% and gradually increase
    setCurrentProgress(5);
    
    let progress = 5;
    let stepIndex = 0;
    
    const interval = setInterval(() => {
      // Slow increment that slows down as it approaches completion
      // Fast at start (1-3%), then slows down near the end
      let increment;
      if (progress < 30) {
        increment = Math.random() * 2 + 1; // 1-3% when < 30%
      } else if (progress < 60) {
        increment = Math.random() * 1.5 + 0.5; // 0.5-2% when 30-60%
      } else if (progress < 85) {
        increment = Math.random() * 1 + 0.3; // 0.3-1.3% when 60-85%
      } else {
        increment = Math.random() * 0.5 + 0.1; // 0.1-0.6% when > 85% (crawl to finish)
      }
      
      progress += increment;
      
      // Cap at 95% - will jump to 100% when isStreaming becomes false (response starts)
      if (progress >= 95) {
        progress = 95;
      }
      
      setCurrentProgress(Math.min(progress, 95));
      
      // Advance steps as progress increases
      const newStepIndex = Math.floor((progress / 100) * thinking.length);
      if (newStepIndex !== stepIndex && newStepIndex < thinking.length) {
        stepIndex = newStepIndex;
        setCurrentStepIndex(stepIndex);
      }
    }, 800); // Update every 800ms
    
    return () => clearInterval(interval);
  }, [isStreaming, thinking.length]);
  
  // Get current step to display
  const currentStep = thinking[currentStepIndex] || thinking[0];
  
  return (
    <div className={shumiStyles.thinkingBlock}>
      <Space direction="vertical" size={10} style={{ width: '100%' }}>
        {/* Header - professional, no emoji */}
        <div className={shumiStyles.thinkingTitle}>
          Analyzing...
        </div>
        
        {/* Animated progress bar with gradient */}
        <Progress
          percent={currentProgress}
          showInfo={false}
          strokeColor={{
            '0%': '#ff4d4d',
            '100%': '#ff8a8a',
          }}
          trailColor="rgba(255, 77, 77, 0.1)"
          strokeWidth={4}
          style={{ margin: 0 }}
        />
        
        {/* Current step - no emoji */}
        {currentStep && (
          <div className={shumiStyles.currentStep}>
            {currentStep.title}
          </div>
        )}
      </Space>
    </div>
  );
};

export default ThinkingBlock;

