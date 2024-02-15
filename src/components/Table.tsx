import { useEffect, useState } from 'react';

import { Button, Col, InputNumber, Row, Select, Slider, Table, message } from 'antd';
import type { TableProps } from 'antd';

import request from '../server/request';
import REGIONS from '../constants';

interface DataType {
  index: string;
  id: string;
  name: string;
  address: string;
  phone: string;
}

const columns: TableProps<DataType>['columns'] = [
  {
    title: 'Index',
    dataIndex: 'index',
    key: 'index',
  },
  {
    title: 'Id',
    dataIndex: 'id',
    key: 'id',
  },
  {
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: "Address",
    dataIndex: "address",
    key: "address"
  },
  {
    title: 'Phone',
    dataIndex: "phone",
    key: 'phone',
  },
];

const DataTable = () => {
  const [data, setData] = useState<DataType[]>([])
  const [region, setRegion] = useState("USA");
  const [sliderValue, setSliderValue] = useState(0);
  const [inputValue, setInputValue] = useState(0);
  const [seedValue, setSeedValue] = useState(0)

  const handleSliderChange = (value: number) => {
    if (isNaN(value)) {
      return;
    }
    setSliderValue(value);
    setInputValue(value);
  };

  const handleInputChange = (value: number | null) => {
    if (value === null) {
      setInputValue(0);
      setSliderValue(0);
    } else if (!isNaN(value)) {
      setInputValue(value);
      const newValue = value / 100;
      setSliderValue(Math.min(newValue, 10));
    }
  };

  const handleSeedChange = (value: number | undefined | null) => {
    if (value === undefined || value === null) {
      setSeedValue(0);
    } else {
      setSeedValue(value);
    }
  };

  const handleRegion = (value: string) => {
    setRegion(value)
  }

  const generateRandomSeed = () => {
    const randomSeed = Math.floor(Math.random() * 1000); // Generate a random number between 0 and 1000
    setSeedValue(randomSeed);
  };

  useEffect(() => {
    const getData = async () => {
      try {
        const params = {
          region: region,
          errorsPerRecord: sliderValue,
          seed: seedValue,
          pageNumber: 1,

        }
        const { data } = await request.get("generate", { params });

        setData(data)
      } catch (error) {
        message.error("Something went wrong. Please try again later")

      }
    }

    getData()
  }, [seedValue, sliderValue, region])

  return (
    <div>
      <div className="controllers">
        <div className="controllers__select">
          <Select onSelect={handleRegion} style={{ width: "150px" }} defaultValue="Select region" options={REGIONS} />
          <Row>
            <Col span={4}>
              <Slider
                min={0}
                max={10}
                onChange={handleSliderChange}
                value={sliderValue}
                step={0.1}
              />
            </Col>
            <Col span={4}>
              <InputNumber
                min={0}
                max={1000}
                style={{ margin: '0 16px' }}
                step={0.1}
                value={inputValue}
                onChange={handleInputChange}
              />
            </Col>
          </Row>
          <Row>
            <InputNumber min={1} value={seedValue} defaultValue={0} onChange={handleSeedChange} />
            <Button onClick={generateRandomSeed} style={{ marginLeft: '10px' }}>Generate Random Seed</Button>
          </Row>
        </div>
      </div>
      <Table
        columns={columns}
        bordered
        size='small'
        pagination={false}
        dataSource={data.map((person) => ({ ...person, key: person?.id }))}
      />
    </div>)

};

export default DataTable;