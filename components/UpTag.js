import { Tag } from 'antd'
import classnames from 'classnames'

import variableStyles from '../styles/variables.module.less'
import signalStyles from '../styles/signalTag.module.less'

const UpTag = ({ className = '' }) => <Tag className={classnames(signalStyles.tag, className)} color={variableStyles.successColor}>UP</Tag>

export default UpTag