import { Card, Space, Progress } from 'antd';
import shumiStyles from '../styles/shumi.module.less';

/**
 * ShumiThoughtProcess - Crypto-native thinking display
 * 
 * @param {Array} thinking - Array of thinking steps
 * @param {boolean} isStreaming - Whether AI is currently thinking
 * 
 * Example thinking format:
 * [
 *   {
 *     step: 1,
 *     title: "Reading the signals",
 *     emoji: "🔍",
 *     status: "complete",
 *     duration: 342
 *   },
 *   ...
 * ]
 */
const ThinkingBlock = ({ thinking = [], isStreaming = false }) => {
  if (!thinking || thinking.length === 0) return null;
  
  // Calculate progress
  const doneSteps = thinking.filter(t => t.status === 'complete').length;
  const progress = (doneSteps / thinking.length) * 100;
  
  // Find active step
  const activeStep = thinking.find(s => s.status === 'active') || thinking[doneSteps];
  
  return (
    <Card
      className={shumiStyles.thinkingBlock}
      bordered={false}
      bodyStyle={{ padding: 16 }}
    >
      <Space direction="vertical" size={12} style={{ width: '100%' }}>
        {/* Header with mushroom emoji */}
        <Space>
          <span style={{ fontSize: 20 }}>🍄</span>
          <span className={shumiStyles.thinkingTitle}>
            Shumi is cooking...
          </span>
        </Space>
        
        {/* Progress bar with gradient */}
        <Progress
          percent={progress}
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
        {activeStep && (
          <div className={shumiStyles.currentStep}>
            {activeStep.emoji && <span>{activeStep.emoji}</span>}
            <span>{activeStep.title}</span>
          </div>
        )}
      </Space>
    </Card>
  );
};

export default ThinkingBlock;

