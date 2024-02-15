import { useCallback, useEffect, useRef, useState } from 'react';

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
  const [data, setData] = useState<DataType[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [pageNumber, setPageNumber] = useState(1);
  const [region, setRegion] = useState("USA");
  const [sliderValue, setSliderValue] = useState(0);
  const [inputValue, setInputValue] = useState(0);
  const [seedValue, setSeedValue] = useState(0);

  const observer = useRef<IntersectionObserver>();
  const lastRowRef = useCallback((node: Element | null) => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPageNumber(prevPageNumber => prevPageNumber + 1);
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, hasMore]);

  useEffect(() => {
    let isActive = true;

    const fetchData = async () => {
      if (!isActive) return;
      setLoading(true);
      try {
        const params = { region, errorsPerRecord: sliderValue, seed: seedValue, pageNumber };
        const response = await request.get("generate", { params });
        if (isActive) { 
          const newData = response.data;
          if (pageNumber === 1) {
            setData(newData); 
          } else {
            setData(prevData => [...prevData, ...newData]);
          }
          setHasMore(newData.length > 0);
        }
      } catch (error) {
        if (isActive) message.error("Something went wrong. Please try again later");
      } finally {
        if (isActive) setLoading(false);
      }
    };

    fetchData();

    return () => {
      isActive = false;
    };
  }, [region, sliderValue, seedValue, pageNumber]);



  const handleSliderChange = (value: number) => {
    if (isNaN(value)) {
      return;
    }
    setPageNumber(1);
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
      setPageNumber(1);
    }
  };

  const handleRegion = (value: string) => {
    setRegion(value);
    setPageNumber(1);
    setData([]);
    setHasMore(true);
  }


  const generateRandomSeed = () => {
    const randomSeed = Math.floor(Math.random() * 1000);
    setSeedValue(randomSeed);
    setPageNumber(1);
    setData([]);
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
        dataSource={data.map((person, index) => ({
          ...person,
          key: person?.id || index,
        }))}
        rowKey="id"
      />
      {loading && <div>Loading...</div>}
      <div ref={hasMore ? lastRowRef : null} style={{ height: 20, background: 'transparent' }} />
    </div>)

};

export default DataTable;