import { Select } from 'antd'
import { SearchOutlined, CloseOutlined } from "@ant-design/icons";
import { useState } from 'react';

import searchStyles from '../styles/search.module.less'

const { Option, OptGroup } = Select;

const Search = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  // TODO: Get coins data with thumb, name, symbol with global data
  // TODO: Get categories names with global data instead of the index page
  // TODO: Show the appropriate options
  return (
    <Select
      showSearch
      placeholder="Search"
      className={searchStyles.search}
      suffixIcon={isOpen ? <CloseOutlined /> : <SearchOutlined />}
      onDropdownVisibleChange={() => setIsOpen(!isOpen)}
      onSearch={(value) => setQuery(value)}
      onClear={() => setQuery("")}
    >
      <OptGroup label="Coins">
        <Option value="1">Not Identified</Option>
      </OptGroup>
      <OptGroup label="Categories">
        <Option value="2">Cat</Option>
      </OptGroup>
    </Select>
  );
}

export default Search