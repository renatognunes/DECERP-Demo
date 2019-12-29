import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Popconfirm,
  Icon,
  Col,
  Row,
  Select,
  InputNumber,
  Checkbox,
  Input,
} from 'antd';
import { connect } from 'dva';
import { ConnectState } from '@/models/connect';
import { IMaterial } from '@/models/settings/resources/material';

const { Option } = Select;

interface CreateIETableProps {
  handleChange: (key: string, value: any) => void;
  materialList: IMaterial[];
}

export interface Item {
  key: number;
  description: string;
  material_id?: number;
  quantity: number;
  amount: number;
  rate: number;
  self_use: boolean;
  chargeable: boolean;
  returnable: boolean;
  purpose: string;
}

const INITIAL_STATE = [
  {
    key: 1,
    description: '',
    material_id: undefined,
    quantity: 1,
    amount: 0.0,
    rate: 0.0,
    self_use: false,
    chargeable: false,
    returnable: false,
    purpose: '',
  },
];

const CreateIETable = (props: CreateIETableProps) => {
  const [count, incrementCount] = useState<number>(2);
  const [items, setItems] = useState<Item[]>(INITIAL_STATE);

  useEffect(() => {
    props.handleChange('items', items);
  }, [items]);

  const columns: any = [
    {
      title: 'Item Details',
      dataIndex: 'description',
      width: '22%',
      editable: true,
      itemDetails: true,
      render: (description: string, record: Item) => {
        return (
          <Select
            showSearch
            optionFilterProp="children"
            placeholder={`Select Material`}
            onChange={(value: any) => handleMaterial(value, record.key)}
            filterOption={(input: any, option: any) =>
              option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
          >
            {props.materialList.map((material: IMaterial) => (
              <Option key={material.id} value={material.id}>
                {material.name}
              </Option>
            ))}
          </Select>
        );
      },
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      editable: true,
      width: '9%',
      align: 'center',
      quantity: true,
      render: (quantity: string, record: Item) => {
        return (
          <InputNumber
            disabled={record.material_id ? false : true}
            type="number"
            value={record['quantity']}
            min={1.0}
            step={0.01}
            style={{ width: '99%' }}
            onChange={(value: any) => {
              const payload = value && value !== '' ? value : 1.0;
              handleQuantity(payload, record.key);
            }}
          />
        );
      },
    },
    {
      title: 'Rate',
      dataIndex: 'rate',
      width: '8%',
      align: 'center',
      render: (rate: number) => <span>{rate.toFixed(2)}</span>,
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      width: '9%',
      align: 'center',
      render: (amount: number) => <span>{amount.toFixed(2)}</span>,
    },
    {
      title: 'Self Use',
      dataIndex: 'self_use',
      editable: true,
      selfUse: true,
      width: '10%',
      align: 'center',
      render: (self_use: string, record: Item) => (
        <Checkbox
          disabled={record.material_id ? false : true}
          onChange={e => handleChange(e.target.checked, 'self_use', record.key)}
        ></Checkbox>
      ),
    },
    {
      title: 'Chargeable',
      dataIndex: 'chargeable',
      editable: true,
      chargeable: true,
      width: '10%',
      align: 'center',
      render: (chargeable: string, record: Item) => (
        <Checkbox
          disabled={record.material_id ? false : true}
          onChange={e => handleChange(e.target.checked, 'chargeable', record.key)}
        ></Checkbox>
      ),
    },
    {
      title: 'Returnable',
      dataIndex: 'returnable',
      editable: true,
      returnable: true,
      width: '10%',
      align: 'center',
      render: (returnable: string, record: Item) => (
        <Checkbox
          disabled={record.material_id ? false : true}
          onChange={e => handleChange(e.target.checked, 'returnable', record.key)}
        ></Checkbox>
      ),
    },

    {
      title: 'Purpose',
      dataIndex: 'purpose',
      editable: true,
      width: '18%',
      align: 'center',
      purpose: true,
      render: (purpose: string, record: Item) => {
        return (
          <Input
            disabled={record.material_id ? false : true}
            type="text"
            value={record['purpose']}
            onChange={e => handleChange(e.target.value, 'purpose', record.key)}
          ></Input>
        );
      },
    },
    {
      title: '',
      dataIndex: 'operation',
      className: 'delete-column',
      width: '0%',
      render: (text: any, record: any) =>
        items.length >= 1 ? (
          <Popconfirm
            placement="leftBottom"
            title="Sure to delete?"
            onConfirm={() => handleDelete(record.key)}
          >
            <Icon style={{ marginTop: 4, fontSize: '20px', color: 'red' }} type="close-circle" />
          </Popconfirm>
        ) : null,
    },
  ];

  const handleChange = (value: any, property: string, key: number) => {
    const newItems = items.map((item: Item) => {
      return item.key === key ? Object.assign({}, item, { [property]: value }) : item;
    });
    setItems(newItems);
  };

  const handleNewMaterial = (value: number, key: number) => {
    const material = props.materialList.filter((material: IMaterial) => material.id === value)[0];

    const newMaterial = {
      description: material.name,
      material_id: material.id,
      rate: Number.parseFloat(material.rate),
      amount: Number.parseFloat(material.rate),
    };

    return items.map((item: Item) => {
      return item.key === key ? Object.assign({}, item, newMaterial) : item;
    });
  };

  const handleMaterial = (value: number, key: number) => {
    const newItems = handleNewMaterial(value, key);
    setItems(newItems);
  };

  const handleQuantity = (value: number, key: number) => {
    const newItems = items.map((item: Item) => {
      return item.key === key
        ? Object.assign({}, item, { quantity: value, amount: value * item.rate })
        : item;
    });
    setItems(newItems);
  };

  const handleDelete = (key: number) => {
    const newItems = items.filter((item: Item) => item.key !== key);
    setItems(newItems);
  };

  const handleAdd = () => {
    const newItem = {
      key: count,
      description: '',
      material_id: undefined,
      quantity: 0,
      amount: 0.0,
      rate: 0.0,
      self_use: false,
      chargeable: false,
      returnable: false,
      purpose: '',
    };

    setItems([...items, newItem]);
    incrementCount(count + 1);
  };

  return (
    <div style={{ marginTop: 20 }}>
      <Table
        size={'middle'}
        pagination={false}
        rowClassName={() => 'editable-row'}
        bordered
        dataSource={items}
        columns={columns}
      />

      <Row type="flex">
        <Col span={12}>
          <Button
            type="link"
            onClick={handleAdd}
            style={{ fontSize: 16, marginBottom: 15, marginTop: 8 }}
          >
            <Icon type="plus" />
            Add Another Item
          </Button>
        </Col>
      </Row>
    </div>
  );
};

const mapStateToProps = (state: ConnectState) => ({
  materialList: state.material.materials,
});
export default connect(mapStateToProps)(CreateIETable);
