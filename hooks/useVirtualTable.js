import { useMemo } from 'react'
import { VList } from 'virtuallist-antd'

const useVirtualTable = () => {
  // The table rows are 57px high.
  const tableHeight = 10 * 57;
  const vComponents = useMemo(() => {
		return VList({
			height: tableHeight
		})
	}, [tableHeight])

  return {
    scroll: {
      y: tableHeight
    },
    components: vComponents
  }
}

export default useVirtualTable;