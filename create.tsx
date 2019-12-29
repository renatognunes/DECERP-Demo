import React, { useState, useEffect } from 'react';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import { PostEmployeeType } from '@/models/dashboard/hr/employee';
import { FormComponentProps } from 'antd/lib/form/Form';
import { Dispatch, AnyAction } from 'redux';
import { Link } from 'react-router-dom';
import moment from 'moment';
import { connect } from 'dva';
import { ConnectState } from '@/models/connect';
import { Attributes, EmployeeModelState } from '@/models/dashboard/hr/employee';
import {
  Card,
  Form,
  Input,
  Row,
  Col,
  Upload,
  Icon,
  message,
  Divider,
  Tabs,
  DatePicker,
  Select,
  AutoComplete,
  Button,
} from 'antd';

const { TabPane } = Tabs;
const { TextArea } = Input;
const { Option } = Select;

interface ManageEmployeesProps extends FormComponentProps {
  dispatch: Dispatch<AnyAction>;
  department: Attributes[];
  designation: Attributes[];
  employee: EmployeeModelState;
  submitting: boolean;
  match: { params: { id: string } };
  history: any;
  props: {
    name: 'file';
    action: 'https://www.mocky.io/v2/5cc8019d300000980a055e76';
    headers: {
      authorization: 'authorization-text';
    };
  };
}

const INITIAL_STATE = {
  employee_no: '',
  name: '',
  email: '',
  contact_no: '',
  mobile_no: '',
  department_id: '',
  designation_id: '',
  date_of_joining: '',
  pan: '',
  aadhar: '',
  profile: null,
  pan_file: null,
  aadhar_file: null,
  medical_certificate: null,
  dob: '',
  blood_group: '',
  address: '',
  city: '',
  pincode: '',
  state: '',
  notes: '',
};

// Image Upload Helper Functions
function getBase64(img: any, callback: any) {
  const reader = new FileReader();
  reader.addEventListener('load', () => callback(reader.result));
  reader.readAsDataURL(img);
}

function beforeUpload(file: any) {
  const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
  if (!isJpgOrPng) {
    message.error('You can only upload JPG/PNG file!');
  }
  const isLt2M = file.size / 1024 / 1024 < 2;
  if (!isLt2M) {
    message.error('Image must smaller than 2MB!');
  }
  return isJpgOrPng && isLt2M;
}

const ManageEmployees: React.FC<ManageEmployeesProps> = props => {
  const [employee, setEmployee] = useState<PostEmployeeType>(INITIAL_STATE);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [departments, setDepartments] = useState<string[] | []>([]);
  const [designations, setDesignations] = useState<string[] | []>([]);
  const [isLoading, setLoading] = useState<boolean>(false);

  const { id } = props.match.params;

  const resetState = () => {
    setEmployee(INITIAL_STATE);
  };

  useEffect(() => {
    const { dispatch } = props;
    dispatch({
      type: 'department/getAllDepartments',
    });
    dispatch({
      type: 'designation/getAllDesignations',
    });
  }, []);

  useEffect(() => {
    if (props.department && departments !== props.department) {
      const newDepartments = props.department.map((item: Attributes) => {
        return item.name;
      });
      setDepartments(newDepartments);
    }
    if (props.designation && designations !== props.designation) {
      const newDesignations = props.designation.map((item: Attributes) => {
        return item.name;
      });
      setDesignations(newDesignations);
    }
  }, [props.department, props.designation]);

  useEffect(() => {
    if (props.employee.response && props.employee.response.code === '200') {
      props.history.push(`/${id}/hr/employees`);
      resetState();
      props.form.resetFields();
      message.success('Employee has been created');
    }
  }, [props.employee]);

  const handleChange = (key: keyof PostEmployeeType, value: any) => {
    setEmployee({
      ...employee,
      [key]: value,
    } as any);
  };

  const handleFileChange = (key: keyof PostEmployeeType, info: any) => {
    if (info.file.status === 'done') {
      info.file.name = message.success(`${info.file.name} file uploaded successfully`);
      handleChange(key, info.file.originFileObj);
    } else if (info.file.status === 'error') {
      message.error(`${info.file.name} file upload failed.`);
    }
  };

  const handleImageChange = (info: any) => {
    if (info.file.status === 'uploading') {
      setLoading(true);
      return;
    }
    if (info.file.status === 'done') {
      getBase64(info.file.originFileObj, (imageUrl: any) => {
        setEmployee({
          ...employee,
          profile: info.file.originFileObj,
        });
        setImageUrl(imageUrl);
        setLoading(false);
      });
    }
  };

  const disabledDate = (current: any) => {
    const customDate = moment()
      .subtract(6573, 'days')
      .calendar();
    return current && current > moment(customDate, 'MM-DD-YYYY');
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    props.form.validateFields((err, values) => {
      if (!err) {
        const { profile, pan_file, aadhar_file, medical_certificate, ...newData } = employee;

        const formData = new FormData();

        const files = { profile, pan_file, aadhar_file, medical_certificate };
        const fileKeys = Object.entries(files);
        for (let i = 0; i < fileKeys.length; i++) {
          if (fileKeys[i][1]) {
            const file: any = fileKeys[i][1];
            const blob = new Blob([file], {
              type: 'multipart/form-data',
            });
            formData.append(`${fileKeys[i][0]}`, blob);
          }
        }

        for (const key in newData) {
          if (newData[key].trim() !== '') {
            formData.append(key, newData[key]);
          }
        }
        return handleNewEmployee(formData);
      } else {
        return;
      }
    });
  };

  const handleNewEmployee = async (data: any) => {
    const { dispatch }: any = props;
    dispatch({
      type: 'employee/postNewEmployee',
      payload: { data, id },
    });
  };

  const uploadButton = (
    <div>
      <Icon type={isLoading ? 'loading' : 'paper-clip'} />
      <div className="ant-upload-text">Profile Image</div>
    </div>
  );

  const { getFieldDecorator } = props.form;

  return (
    <PageHeaderWrapper
      title={'New Employee'}
      content={<Link to={`/${id}/hr/employees`}>Back</Link>}
    >
      <Card className="card-container-wrapper">
        <Form onSubmit={handleSubmit}>
          <Card className="card-container-top">
            <Row gutter={14} type="flex">
              <Col
                xs={{ order: 1 }}
                sm={{ span: 24, order: 1 }}
                md={{ span: 24, order: 1 }}
                lg={{ span: 16, order: 0 }}
                xl={{ span: 16, order: 0 }}
              >
                <Form.Item
                  required={false}
                  label="Employee ID"
                  labelAlign="left"
                  colon={false}
                  labelCol={{ span: 8 }}
                  wrapperCol={{ span: 16 }}
                >
                  {getFieldDecorator('employee_no', {
                    rules: [
                      {
                        required: true,
                        message: 'Please provide a Employee ID',
                      },
                      { max: 20, message: 'Employee ID must be max of 20 characters.' },
                    ],
                  })(
                    <Input
                      type="text"
                      name="employeeName"
                      onChange={e => handleChange('employee_no', e.target.value)}
                    />,
                  )}
                </Form.Item>

                <Form.Item
                  required={false}
                  label="Employee Name"
                  labelAlign="left"
                  colon={false}
                  labelCol={{ span: 8 }}
                  wrapperCol={{ span: 16 }}
                >
                  {getFieldDecorator('name', {
                    rules: [
                      {
                        required: true,
                        message: 'Please provide a Employee Name',
                      },
                    ],
                  })(
                    <Input
                      type="text"
                      name="employeeName"
                      onChange={e => handleChange('name', e.target.value)}
                    />,
                  )}
                </Form.Item>

                <Form.Item
                  required={false}
                  label="Contact Email"
                  labelAlign="left"
                  colon={false}
                  labelCol={{ span: 8 }}
                  wrapperCol={{ span: 16 }}
                >
                  {getFieldDecorator('email', {
                    rules: [
                      {
                        required: true,
                        message: 'Please provide a Contact Email',
                      },
                    ],
                  })(
                    <Input
                      type="text"
                      name="contactEmail"
                      onChange={e => handleChange('email', e.target.value)}
                    />,
                  )}
                </Form.Item>

                <Form.Item
                  label="Contact Phone"
                  labelAlign="left"
                  colon={false}
                  labelCol={{ span: 8 }}
                  wrapperCol={{ span: 16 }}
                >
                  <Form.Item
                    style={{
                      display: 'inline-block',
                      width: 'calc(50% - 12px)',
                      marginRight: 24,
                      marginBottom: 5,
                    }}
                  >
                    {getFieldDecorator('contact_no', {
                      rules: [
                        {
                          required: false,
                        },
                        { pattern: /^[0-9]*$/, message: 'Only numbers allowed' },
                        { min: 8, message: 'Must be at least 8 digits' },
                        { max: 12, message: 'Must be max of 12 digits' },
                      ],
                    })(
                      <Input
                        placeholder="Work Phone"
                        type="number"
                        name="contactPhoneWork"
                        onChange={e => handleChange('contact_no', e.target.value)}
                      />,
                    )}
                  </Form.Item>

                  <Form.Item
                    style={{
                      display: 'inline-block',
                      width: 'calc(50% - 12px)',
                      marginBottom: 5,
                    }}
                  >
                    {getFieldDecorator('mobile_no', {
                      rules: [
                        {
                          required: true,
                          message: 'Please provide a Mobile',
                        },
                        { len: 10, message: 'Must be 10 digits' },
                        { pattern: /^[0-9]*$/, message: 'Only numbers allowed' },
                      ],
                    })(
                      <Input
                        placeholder="Mobile"
                        type="number"
                        name="contactPhoneMobile"
                        onChange={e => handleChange('mobile_no', e.target.value)}
                      />,
                    )}
                  </Form.Item>
                </Form.Item>
                <Divider />
                <Form.Item
                  label="Department"
                  labelAlign="left"
                  colon={false}
                  labelCol={{ span: 8 }}
                  wrapperCol={{ span: 16 }}
                  required={false}
                >
                  {getFieldDecorator('department_id', {
                    rules: [
                      {
                        required: true,
                        message: 'Please provide a Department',
                      },
                    ],
                  })(
                    <AutoComplete
                      placeholder="department"
                      filterOption={(inputValue: any, option: any) =>
                        option.props.children.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1
                      }
                      dataSource={departments}
                      onSelect={(value: any) => handleChange('department_id', value)}
                      onChange={(value: any) => handleChange('department_id', value)}
                    >
                      <Input />
                    </AutoComplete>,
                  )}
                </Form.Item>
                <Form.Item
                  label="Designation"
                  labelAlign="left"
                  colon={false}
                  labelCol={{ span: 8 }}
                  wrapperCol={{ span: 16 }}
                  required={false}
                >
                  {getFieldDecorator('designation_id', {
                    rules: [
                      {
                        required: true,
                        message: 'Please provide a Designation',
                      },
                    ],
                  })(
                    <AutoComplete
                      placeholder="designation"
                      filterOption={(inputValue: any, option: any) =>
                        option.props.children.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1
                      }
                      dataSource={designations}
                      onSelect={(value: any) => handleChange('designation_id', value)}
                      onChange={(value: any) => handleChange('designation_id', value)}
                    >
                      <Input />
                    </AutoComplete>,
                  )}
                </Form.Item>

                <Form.Item
                  label="Date of Joining"
                  labelAlign="left"
                  colon={false}
                  labelCol={{ span: 8 }}
                  wrapperCol={{ span: 16 }}
                >
                  <DatePicker
                    format="DD-MM-YYYY"
                    style={{ width: '100%' }}
                    onChange={(value, dateString) => handleChange('date_of_joining', dateString)}
                  />
                </Form.Item>
              </Col>

              <Col
                xs={{ order: 0 }}
                sm={{ order: 0 }}
                md={{ span: 24, order: 0 }}
                lg={{ span: 8, order: 0 }}
                xl={{ order: 0 }}
                style={{ marginTop: 4, marginBottom: 20 }}
              >
                <Upload
                  name="avatar"
                  listType="picture-card"
                  className="avatar-uploader"
                  showUploadList={false}
                  action="https://www.mocky.io/v2/5cc8019d300000980a055e76"
                  beforeUpload={beforeUpload}
                  onChange={handleImageChange}
                >
                  {imageUrl ? (
                    <img src={`${imageUrl}`} alt="avatar" style={{ width: '100%' }} />
                  ) : (
                    uploadButton
                  )}
                </Upload>
              </Col>
            </Row>
          </Card>

          <Card
            className="card-container-bottom"
            style={{ marginTop: 10, backgroundColor: 'transparent', border: 'none' }}
          >
            <div className="card-container">
              <Tabs defaultActiveKey="1" size="default" className="ant-tabs-card">
                <TabPane tab="Proof Details" key="1">
                  <Form.Item
                    label="PAN"
                    labelAlign="left"
                    colon={false}
                    labelCol={{ span: 5 }}
                    wrapperCol={{ span: 15 }}
                  >
                    <Form.Item style={{ display: 'inline-block', width: 'calc(75% - 12px)' }}>
                      {getFieldDecorator('pan', {
                        rules: [
                          {
                            required: false,
                          },
                          { len: 10, message: 'Must be 10 characters' },
                        ],
                      })(
                        <Input
                          type="text"
                          name="pan"
                          onChange={e => handleChange('pan', e.target.value)}
                        />,
                      )}
                    </Form.Item>

                    <Form.Item style={{ display: 'inline-block', width: 'calc(25% - 12px)' }}>
                      <Upload {...props} onChange={file => handleFileChange('pan_file', file)}>
                        <Button>
                          <Icon type="paper-clip" /> Attach Proof
                        </Button>
                      </Upload>
                    </Form.Item>
                  </Form.Item>

                  <Form.Item
                    label="Aadhar Number"
                    labelAlign="left"
                    colon={false}
                    labelCol={{ span: 5 }}
                    wrapperCol={{ span: 15 }}
                  >
                    <Form.Item style={{ display: 'inline-block', width: 'calc(75% - 12px)' }}>
                      {getFieldDecorator('aadhar', {
                        rules: [
                          {
                            required: false,
                          },
                          { len: 10, message: 'Must be 10 digits' },
                          { pattern: /^0|[1-9]\d*$/, message: 'Only numbers allowed' },
                        ],
                      })(
                        <Input
                          type="text"
                          name="aadharNumber"
                          onChange={e => handleChange('aadhar', e.target.value)}
                        />,
                      )}
                    </Form.Item>
                    <Form.Item style={{ display: 'inline-block', width: 'calc(25% - 12px)' }}>
                      <Upload {...props} onChange={file => handleFileChange('aadhar_file', file)}>
                        <Button>
                          <Icon type="paper-clip" /> Attach Proof
                        </Button>
                      </Upload>
                    </Form.Item>
                  </Form.Item>
                </TabPane>

                <TabPane tab="Medical Details" key="2">
                  <Row>
                    <Col span={16}>
                      <Form.Item
                        label="Date of Birth"
                        labelAlign="left"
                        colon={false}
                        labelCol={{ span: 8 }}
                        wrapperCol={{ span: 16 }}
                      >
                        <DatePicker
                          format="DD-MM-YYYY"
                          disabledDate={disabledDate}
                          style={{ width: '100%' }}
                          onChange={(value, dateString) => handleChange('dob', dateString)}
                        />
                      </Form.Item>
                      <Form.Item
                        label="Blood Group"
                        labelAlign="left"
                        colon={false}
                        labelCol={{ span: 8 }}
                        wrapperCol={{ span: 16 }}
                      >
                        {getFieldDecorator('blood_group', {
                          rules: [
                            {
                              required: false,
                            },
                            { len: 2, message: 'Must be 2 digits' },
                          ],
                        })(
                          <Input
                            type="text"
                            name="bloodGroup"
                            onChange={e => handleChange('blood_group', e.target.value)}
                          />,
                        )}
                      </Form.Item>

                      <Form.Item
                        label="Medical Certificate"
                        labelAlign="left"
                        colon={false}
                        labelCol={{ span: 8 }}
                        wrapperCol={{ span: 16 }}
                      >
                        <Upload
                          {...props}
                          onChange={file => handleFileChange('medical_certificate', file)}
                        >
                          <Button>
                            <Icon type="paper-clip" /> Attach Certificate
                          </Button>
                        </Upload>
                      </Form.Item>
                    </Col>
                    <Col span={8}></Col>
                  </Row>
                </TabPane>
                <TabPane tab="Address" key="3">
                  <Row>
                    <Col span={16}>
                      <Form.Item
                        label="Address"
                        labelAlign="left"
                        colon={false}
                        labelCol={{ span: 8 }}
                        wrapperCol={{ span: 16 }}
                      >
                        <TextArea
                          autosize={{ minRows: 2, maxRows: 6 }}
                          name="address"
                          onChange={e => handleChange('address', e.target.value)}
                          value={employee.address}
                        />
                      </Form.Item>
                      <Form.Item
                        label="City"
                        labelAlign="left"
                        colon={false}
                        labelCol={{ span: 8 }}
                        wrapperCol={{ span: 16 }}
                      >
                        <Input
                          type="text"
                          name="city"
                          onChange={e => handleChange('city', e.target.value)}
                          value={employee.city}
                        />
                      </Form.Item>
                      <Form.Item
                        label="Pin Code"
                        labelAlign="left"
                        colon={false}
                        labelCol={{ span: 8 }}
                        wrapperCol={{ span: 16 }}
                      >
                        <Input
                          type="text"
                          name="pinCode"
                          onChange={e => handleChange('pincode', e.target.value)}
                          value={employee.pincode}
                        />
                      </Form.Item>

                      <Form.Item
                        label="State"
                        labelAlign="left"
                        colon={false}
                        labelCol={{ span: 8 }}
                        wrapperCol={{ span: 16 }}
                      >
                        <Select
                          showSearch
                          placeholder="Select a state"
                          optionFilterProp="children"
                          onChange={(value: any, index: any) => handleChange('state', value)}
                          filterOption={(input: any, option: any) =>
                            option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                          }
                        >
                          <Option value="Tamil Nadu">Tamil Nadu</Option>
                          <Option value="Andra Pradesh">Andra Pradesh</Option>
                          <Option value="Karnataka">Karnataka</Option>
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col span={8}></Col>
                  </Row>
                </TabPane>
                <TabPane tab="Notes" key="4">
                  <Row>
                    <Col span={16}>
                      <Form.Item
                        label="Notes"
                        labelAlign="left"
                        colon={false}
                        labelCol={{ span: 8 }}
                        wrapperCol={{ span: 16 }}
                      >
                        <TextArea
                          autosize={{ minRows: 6, maxRows: 12 }}
                          name="notes"
                          onChange={e => handleChange('notes', e.target.value)}
                          value={employee.notes}
                        />
                      </Form.Item>
                    </Col>
                    <Col span={8}></Col>
                  </Row>
                </TabPane>
              </Tabs>
            </div>
          </Card>
          <Form.Item>
            <Button
              loading={props.submitting}
              type="primary"
              htmlType="submit"
              size="large"
              className="btn-save"
            >
              Save
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </PageHeaderWrapper>
  );
};

const mapStateToProps = (state: ConnectState) => ({
  employee: state.employee,
  submitting: state.loading.effects['employee/postNewEmployee'],
  department: state.department.departments,
  designation: state.designation.designations,
});

const WrappedManageEmployees = Form.create({ name: 'ManageEmployees' })(ManageEmployees);

export default connect(mapStateToProps)(WrappedManageEmployees);
