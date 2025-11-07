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
  
  // Animate progress while streaming
  useEffect(() => {
    if (!isStreaming) {
      setCurrentProgress(100);
      return;
    }
    
    // Start from 10% and gradually increase
    setCurrentProgress(10);
    
    let progress = 10;
    let stepIndex = 0;
    
    const interval = setInterval(() => {
      // Increment progress
      progress += Math.random() * 8 + 2; // Random between 2-10% per tick
      
      if (progress >= 100) {
        progress = 95; // Cap at 95% until truly complete
      }
      
      setCurrentProgress(Math.min(progress, 95));
      
      // Advance steps as progress increases
      const newStepIndex = Math.floor((progress / 100) * thinking.length);
      if (newStepIndex !== stepIndex && newStepIndex < thinking.length) {
        stepIndex = newStepIndex;
        setCurrentStepIndex(stepIndex);
      }
    }, 400); // Update every 400ms
    
    return () => clearInterval(interval);
  }, [isStreaming, thinking.length]);
  
  // Get current step to display
  const currentStep = thinking[currentStepIndex] || thinking[0];
  
  return (
    <div className={shumiStyles.thinkingBlock}>
      <Space direction="vertical" size={12} style={{ width: '100%' }}>
        {/* Header with mushroom emoji */}
        <Space>
          <span style={{ fontSize: 20 }}>🍄</span>
          <span className={shumiStyles.thinkingTitle}>
            Shumi is cooking...
          </span>
        </Space>
        
        {/* Animated progress bar with gradient */}
        <Progress
          percent={currentProgress}
          showInfo={false}
          strokeColor={{
            '0%': '#ff4d4d',
            '100%': '#ff8a8a',
          }}
          trailColor="rgba(255, 77, 77, 0.1)"
          strokeWidth={6}
          style={{ margin: 0 }}
        />
        
        {/* Current step */}
        {currentStep && (
          <div className={shumiStyles.currentStep}>
            {currentStep.emoji && <span>{currentStep.emoji}</span>}
            <span>{currentStep.title}</span>
          </div>
        )}
      </Space>
    </div>
  );
};

export default ThinkingBlock;

