import { CopyFilled } from '@ant-design/icons';
import { useCallback } from 'react';

import addToClipboard from '../utils/addToClipboard';

const CopyButton = ({ text, after }) => {
  const onClick = useCallback((e) => {
    e.stopPropagation();
    const copy = async () => {
      await addToClipboard(text);
      if (after) {
        after();
      }
    }

    copy()
  }, [after, text]);
  return <CopyFilled onClick={onClick} color="red"/>
}

export default CopyButton