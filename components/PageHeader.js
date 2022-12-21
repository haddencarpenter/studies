import { Tooltip } from "antd"
import { InfoCircleFilled } from "@ant-design/icons"

import styles from "../styles/pageheader.module.less"
import useIsHoverable from "../hooks/useIsHoverable"

const PageHeader = ({ title, tooltipText, prefix, postfix }) => {
  const isHoverable = useIsHoverable()
  return (
    <div className={styles.header}>
      {prefix}
      <h1 className={styles.title}>{title}</h1>
      {tooltipText && (
        <Tooltip
          overlayClassName={styles.tooltip}
          trigger={isHoverable ? 'hover' : 'click'}
          title={tooltipText}
        >
          <InfoCircleFilled className={styles.explainer} />
        </Tooltip>
      )}
      {postfix}
    </div>
  );
}

export default PageHeader