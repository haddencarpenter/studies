import { Modal, Input } from 'antd'
import { SearchOutlined } from "@ant-design/icons";
import { useState, useCallback } from 'react';
import { useRouter } from 'next/router'
import debounce from 'lodash/debounce'

import searchStyles from '../styles/search.module.less'

const Search = ({ categories, coins, collapsed }) => {
  const [searchModalVisible, setSearchModalVisible] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  // TODO: Debounce search
  // TODO: Add category results and change coinOption name
  // TODO: Add search headers
  // TODO: Blur focus from fake input field after click
  // TODO: Try to get the trend in
  // TODO: Add empty results state
  // TODO: Add no results state
  const closeModal = useCallback(() => {
    setSearchModalVisible(false)
    setSearchValue('')
  }, []);
  const router = useRouter()

  let searchTrigger = <div onClick={() => setSearchModalVisible(true)}>
    <Input
      className={searchStyles.searchBar}
      prefix={<>
        <SearchOutlined className={searchStyles.placeholderMagnifier} />
        <span className={searchStyles.placeholderText}>Search</span>
      </>}
    />
  </div>
  if (collapsed) {
    searchTrigger = <div onClick={() => setSearchModalVisible(true)} className={searchStyles.searchIcon} >
      <SearchOutlined className={searchStyles.placeholderMagnifier} />
    </div>
  }
  let coinOptions = null
  const filteredCoins = coins.filter((coin) => {
    return coin.name.toLowerCase().includes(searchValue.toLowerCase()) || coin.symbol.toLowerCase().includes(searchValue.toLowerCase())
  })
  if (filteredCoins.length > 0) {
    coinOptions = (
      filteredCoins.map((coin) => {
        return (
          <div
            className={searchStyles.coinOption}
            key={coin.id}
            onClick={() => {
              closeModal();
              router.push(`/coin/${coin.id}`)}
            }>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={coin.image} alt={coin.name}/>
            <span className={searchStyles.coinName}>{coin.name}</span>
            <span className={searchStyles.coinSymbol}>{coin.symbol.toUpperCase()}</span>
          </div>
        )
      })
    )
  }

  // const categoryOptions = (
  //   <OptGroup label="Categories">
  //     {categories.map((category) => {
  //       return (
  //         <Option
  //           value={category}
  //           key={category}
  //           data-type="category"
  //           className={classnames(searchStyles.categoryOption, searchStyles.option)}
  //         >{category}</Option>
  //       )
  //     })}
  //   </OptGroup>
  // )

  return (
    <div>
      {searchTrigger}
      <Modal
        open={searchModalVisible}
        onCancel={() => setSearchModalVisible(false)}
        className={searchStyles.modal}
        footer={null}
        closeIcon={null}
      >
        <Input
          className={searchStyles.searchSelect}
          allowClear
          prefix={<SearchOutlined className={searchStyles.placeholderMagnifier}/>}
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
        />
        <div className={searchStyles.searchResults}>
          {coinOptions}
        </div>
        {/* <Select
          popupClassName={searchStyles.searchResults}
          filterOption={(input, option) => {
            const matchesValue = option?.value?.toLowerCase()?.includes(input.toLowerCase());
            if (option['data-type'] === 'coin') {
              return matchesValue || option['data-symbol'].toLowerCase().includes(input.toLowerCase());
            } else {
              return matchesValue
            }
          }}
          onSelect={(value, target) => {
            if (target['data-type'] === 'coin') {
              router.push(`/coin/${value}`);
            } else {
              router.push(`/?category=${value}`);
            }
            setTimeout(() => selectRef.current?.blur(), 0);
          }}
        >
          {coinOptions}
          {categoryOptions}
        </Select> */}
      </Modal>
    </div>
  );
}

export default Search