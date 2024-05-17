import styles from "../styles/pageheader.module.less"
import ExplainerModal from './ExplainerModal';
import ConnectButton from './ConnectButton';

const PageHeader = ({ title, explainer, showSource, prefix, postfix, lastUpdated }) => {
  return (
    <div className={styles.header}>
      {prefix}
      <h1 className={styles.title}>{title}</h1>
      {explainer && (
        <ExplainerModal
          title={title}
          explainer={explainer}
          showSource={showSource}
          lastUpdated={lastUpdated}
        />
      )}
      {postfix}
      <ConnectButton />
    </div>
  );
}

export default PageHeader