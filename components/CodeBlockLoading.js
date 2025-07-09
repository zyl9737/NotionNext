import React from 'react'

/**
 * 代码块加载动画组件
 * @param {Object} props
 * @param {boolean} props.show - 是否显示加载动画
 * @param {string} props.className - 额外的CSS类名
 * @returns {JSX.Element}
 */
const CodeBlockLoading = ({ show = false, className = '' }) => {
  if (!show) return null

  return (
    <div className={`code-block-loading ${className}`}>
      <div className="code-loading-container">
        <div className="code-loading-header">
          <div className="code-loading-dots">
            <span className="code-loading-dot red"></span>
            <span className="code-loading-dot yellow"></span>
            <span className="code-loading-dot green"></span>
          </div>
          <div className="code-loading-title">
            <div className="code-loading-skeleton"></div>
          </div>
        </div>
        <div className="code-loading-content">
          <div className="code-loading-line" style={{ width: '85%' }}></div>
          <div className="code-loading-line" style={{ width: '70%' }}></div>
          <div className="code-loading-line" style={{ width: '95%' }}></div>
          <div className="code-loading-line" style={{ width: '60%' }}></div>
          <div className="code-loading-line" style={{ width: '80%' }}></div>
        </div>
      </div>
      
      <style jsx>{`
        .code-block-loading {
          position: relative;
          background: rgba(249, 250, 251, 1);
          border: 1px solid rgba(229, 231, 235, 1);
          border-radius: 0.5rem;
          margin: 1rem 0;
          overflow: hidden;
        }
        
        .dark .code-block-loading {
          background: rgba(17, 24, 39, 1);
          border-color: rgba(55, 65, 81, 1);
        }
        
        .code-loading-container {
          padding: 1rem;
          min-height: 120px;
        }
        
        .code-loading-header {
          display: flex;
          align-items: center;
          margin-bottom: 1rem;
          gap: 0.75rem;
        }
        
        .code-loading-dots {
          display: flex;
          gap: 0.25rem;
        }
        
        .code-loading-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          opacity: 0.6;
        }
        
        .code-loading-dot.red {
          background: #ff5f57;
        }
        
        .code-loading-dot.yellow {
          background: #ffbd2e;
        }
        
        .code-loading-dot.green {
          background: #28ca42;
        }
        
        .code-loading-title {
          flex: 1;
        }
        
        .code-loading-skeleton {
          height: 12px;
          background: linear-gradient(
            90deg,
            rgba(203, 213, 225, 0.4) 25%,
            rgba(203, 213, 225, 0.8) 50%,
            rgba(203, 213, 225, 0.4) 75%
          );
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
          border-radius: 4px;
          width: 120px;
        }
        
        .dark .code-loading-skeleton {
          background: linear-gradient(
            90deg,
            rgba(75, 85, 99, 0.4) 25%,
            rgba(75, 85, 99, 0.8) 50%,
            rgba(75, 85, 99, 0.4) 75%
          );
        }
        
        .code-loading-content {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        
        .code-loading-line {
          height: 14px;
          background: linear-gradient(
            90deg,
            rgba(203, 213, 225, 0.3) 25%,
            rgba(203, 213, 225, 0.6) 50%,
            rgba(203, 213, 225, 0.3) 75%
          );
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
          border-radius: 3px;
          animation-delay: var(--delay, 0ms);
        }
        
        .dark .code-loading-line {
          background: linear-gradient(
            90deg,
            rgba(75, 85, 99, 0.3) 25%,
            rgba(75, 85, 99, 0.6) 50%,
            rgba(75, 85, 99, 0.3) 75%
          );
        }
        
        .code-loading-line:nth-child(1) { --delay: 0ms; }
        .code-loading-line:nth-child(2) { --delay: 200ms; }
        .code-loading-line:nth-child(3) { --delay: 400ms; }
        .code-loading-line:nth-child(4) { --delay: 600ms; }
        .code-loading-line:nth-child(5) { --delay: 800ms; }
        
        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
      `}</style>
    </div>
  )
}

export default CodeBlockLoading
