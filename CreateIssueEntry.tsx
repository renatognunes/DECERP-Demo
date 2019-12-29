import React, { useState, useEffect } from 'react';
import { Card, Form, Input, Button, Divider, Row, Col, DatePicker, Select, Modal } from 'antd';
import { FormComponentProps } from 'antd/lib/form/Form';
import { AnyAction, Dispatch } from 'redux';
import { connect } from 'dva';
import { ConnectState } from '@/models/connect';
import CreateIETable from './CreateIETable';
import { SubContractorModel } from '@/models/dashboard/subcontractors/subcontractor';
import { newWBS as WBS } from '@/models/dashboard/project/wbs';
import { IRole } from '@/models/settings/role';
import { ILocation } from '@/models/settings/location';
import { GetEmployeeType as Employee } from '@/models/dashboard/hr/employee';
import { LabourModel } from '@/models/dashboard/subcontractors/labour';
import { SearchIOWModal } from './SearchIOW/SearchIOWModal';
import { IOWType } from '@/models/settings/resources/iow';
import { Item } from './CreateIETable';

const { Option } = Select;
const { TextArea } = Input;

interface CreateIEProps extends FormComponentProps {
  isSubmitting: boolean;
  project_id: string;
  dispatch: Dispatch<AnyAction>;
  subContractorList: SubContractorModel[];
  employeeList: Employee[];
  WBSList: WBS[];
  roleList: IRole[];
  locationList: ILocation[];
  labourList: LabourModel[];
  selectedIOW: IOWType;
}

interface CreateIEState {
  sub_contractor_id?: number;
  issue_no: string;
  roles: any[];
  wbs_id?: number;
  iow_id?: number;
  iow?: string;
  date: string;
  indent_no: string;
  issued_by?: number;
  location_id?: number;
  labour_id?: number;
  items: Item[];
  notes: string;
}

const INITIAL_STATE = {
  sub_contractor_id: undefined,
  issue_no: '',
  roles: [],
  wbs_id: undefined,
  iow_id: undefined,
  iow: 'Search IOW (from selected WBS)',
  date: '',
  indent_no: '',
  issued_by: undefined,
  location_id: undefined,
  labour_id: undefined,
  items: [],
  notes: '',
};

const CreateIssueEntry = (props: CreateIEProps) => {
  const [state, setState] = useState<CreateIEState>(INITIAL_STATE);
  const [isModalVisible, setModal] = useState<boolean>(false);

  useEffect(() => {
    const { dispatch, project_id } = props;
    if (state.sub_contractor_id) {
      dispatch({
        type: 'labours/getLabourBySubContractor',
        payload: { project_id, sub_contractor_id: state.sub_contractor_id },
      });
    }
  }, [state.sub_contractor_id]);

  useEffect(() => {
    if (props.selectedIOW && props.selectedIOW.id !== state.iow_id) {
      setState({
        ...state,
        iow_id: props.selectedIOW.id,
        iow: `${props.selectedIOW.path} - ${props.selectedIOW.description.substring(0, 28)}...`,
      });
    }
  }, [props.selectedIOW]);

  const handleChange = (key: keyof CreateIEState, value: any) => {
    setState({
      ...state,
      [key]: value,
    });
  };

  const handleRoles = (value: any) => {
    const newRoles = value.map((role: number) => {
      return {
        role_id: role,
      };
    });
    return handleChange('roles', newRoles);
  };

  const openModal = () => {
    setModal(true);
  };

  const closeModal = () => {
    setModal(false);
  };

  const searchIOWModal = (
    <Modal
      destroyOnClose
      maskClosable={false}
      footer={null}
      style={{ top: 20 }}
      width="80%"
      title={
        <div style={{ fontSize: 18 }}>
          <span>Search IOW</span>
        </div>
      }
      visible={isModalVisible}
      onCancel={closeModal}
    >
      <SearchIOWModal
        dispatch={props.dispatch}
        wbs_id={state.wbs_id}
        projectId={props.project_id}
        close={closeModal}
      />
    </Modal>
  );

  const handleData = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    props.form.validateFields((err, values) => {
      if (!err) {
        const items = state.items
          .filter((item: Item) => (item.material_id ? true : false))
          .map((item: Item) => {
            return {
              material_id: item.material_id,
              quantity: item.quantity,
              self_use: item.self_use,
              chargeable: item.chargeable,
              returnable: item.returnable,
              rate: item.rate,
              amount: item.amount,
              ...(item.purpose && { purpose: item.purpose }),
            };
          });

        const payload = {
          sub_contractor_id: state.sub_contractor_id,
          issue_no: state.issue_no,
          ...(state.wbs_id && { wbs_id: state.wbs_id }),
          ...(state.iow_id && { iow_id: state.iow_id }),
          location_id: state.location_id,
          labour_id: state.labour_id,
          issued_by: state.issued_by,
          date: state.date,
          indent_no: state.indent_no,
          roles: state.roles,
          is_active: true,
          ...(state.notes && { notes: state.notes }),
          items: items,
        };

        return handleSubmit(payload);
      } else {
        return;
      }
    });
  };

  const handleSubmit = async (data: any) => {
    console.log(data);
    const { dispatch, project_id: id }: any = props;
    dispatch({
      type: 'issueEntry/addIssueEntry',
      payload: { data, id },
    });
  };

  const { getFieldDecorator } = props.form;

  return (
    <Card className="card-container-wrapper">
      <Form onSubmit={handleData}>
        <Row style={{ paddingLeft: 25 }}>
          <Col span={21}>
            <Form.Item
              required={false}
              label="Sub-Contractor"
              labelAlign="left"
              colon={false}
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 14 }}
            >
              {getFieldDecorator('sub_contractor_id', {
                rules: [
                  {
                    required: true,
                    message: 'Please provide sub-contractor',
                  },
                ],
              })(
                <Select
                  showSearch
                  placeholder="Select sub-contractor"
                  optionFilterProp="children"
                  onSelect={(value: any, index: any) => handleChange('sub_contractor_id', value)}
                  filterOption={(input: any, option: any) =>
                    option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                >
                  {props.subContractorList.map((subContractor: SubContractorModel) => (
                    <Option key={subContractor.id} value={subContractor.id}>
                      {subContractor.company_name}
                    </Option>
                  ))}
                </Select>,
              )}
            </Form.Item>
          </Col>
        </Row>
        <Card className="card-container-top">
          <Row>
            <Col span={11}>
              <Form.Item
                required={false}
                label="Issue #"
                labelAlign="left"
                colon={false}
                labelCol={{ span: 8 }}
                wrapperCol={{ span: 14 }}
              >
                {getFieldDecorator('issue_no', {
                  rules: [
                    {
                      required: true,
                      message: 'Please provide an Issue No',
                    },
                  ],
                })(
                  <Input
                    type="text"
                    name="issueNo"
                    onChange={e => handleChange('issue_no', e.target.value)}
                  />,
                )}
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label="Approved By"
                labelAlign="left"
                colon={false}
                labelCol={{ span: 9, offset: 2 }}
                wrapperCol={{ span: 13 }}
                required={false}
              >
                {getFieldDecorator('roles', {
                  rules: [
                    {
                      required: true,
                      message: 'Please provide User Role',
                    },
                  ],
                })(
                  <Select
                    showSearch
                    mode="multiple"
                    placeholder={`Type to search (from user roles)`}
                    optionFilterProp="children"
                    onChange={(value: any) => handleRoles(value)}
                    filterOption={(input: any, option: any) =>
                      option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                    }
                  >
                    {props.roleList.map((role: IRole) => (
                      <Option key={role.id} value={role.id}>
                        {role.name}
                      </Option>
                    ))}
                  </Select>,
                )}
              </Form.Item>
            </Col>
          </Row>

          <Row>
            <Col span={11}>
              <Form.Item
                required={false}
                label="WBS"
                labelAlign="left"
                colon={false}
                labelCol={{ span: 8 }}
                wrapperCol={{ span: 14 }}
              >
                {getFieldDecorator('wbs_id', {
                  rules: [],
                })(
                  <Select
                    showSearch
                    optionFilterProp="children"
                    placeholder={`Select WBS`}
                    onSelect={(value: any) => handleChange('wbs_id', value)}
                    filterOption={(input: any, option: any) =>
                      option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                    }
                  >
                    {props.WBSList.map((wbs: WBS) => (
                      <Option key={wbs.id} value={wbs.id}>
                        {wbs.name}
                      </Option>
                    ))}
                  </Select>,
                )}
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label="IOW"
                labelAlign="left"
                colon={false}
                labelCol={{ span: 9, offset: 2 }}
                wrapperCol={{ span: 13 }}
                required={false}
              >
                {getFieldDecorator('iow_id', {
                  rules: [],
                  initialValue: state.iow,
                })(
                  <Button
                    disabled={state.wbs_id ? false : true}
                    onClick={() => openModal()}
                    style={{ width: '100%' }}
                  >
                    {state.iow}
                  </Button>,
                )}
              </Form.Item>
              {searchIOWModal}
            </Col>
          </Row>

          <Row>
            <Col span={11}>
              <Form.Item
                required={false}
                label="Date"
                labelAlign="left"
                colon={false}
                labelCol={{ span: 8 }}
                wrapperCol={{ span: 14 }}
              >
                {getFieldDecorator('date', {
                  rules: [
                    {
                      required: true,
                      message: 'Please provide an Date',
                    },
                  ],
                })(
                  <DatePicker
                    onChange={(value, dateString) => handleChange('date', dateString)}
                    style={{ width: '100%' }}
                    name="date"
                    format={'YYYY-MM-DD'}
                  />,
                )}
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label="Indent #"
                labelAlign="left"
                colon={false}
                labelCol={{ span: 9, offset: 2 }}
                wrapperCol={{ span: 13 }}
                required={false}
              >
                {getFieldDecorator('indent_no', {
                  rules: [
                    {
                      required: true,
                      message: 'Please provide Indent No',
                    },
                  ],
                })(
                  <Input
                    type="text"
                    name="indentNo"
                    onChange={e => handleChange('indent_no', e.target.value)}
                  />,
                )}
              </Form.Item>
            </Col>
          </Row>

          <Divider />

          <Row>
            <Col span={11}>
              <Form.Item
                label="Issued By"
                labelAlign="left"
                colon={false}
                labelCol={{ span: 8 }}
                wrapperCol={{ span: 14 }}
                required={false}
              >
                {getFieldDecorator('issued_by', {
                  rules: [
                    {
                      required: true,
                      message: 'Please provide Employee',
                    },
                  ],
                })(
                  <Select
                    showSearch
                    placeholder={`Select Employee`}
                    optionFilterProp="children"
                    onSelect={(value: any) => handleChange('issued_by', value)}
                    filterOption={(input: any, option: any) =>
                      option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                    }
                  >
                    {props.employeeList.map((employee: Employee) => (
                      <Option key={employee.id} value={employee.id}>
                        {employee.name}
                      </Option>
                    ))}
                  </Select>,
                )}
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Location"
                labelAlign="left"
                colon={false}
                labelCol={{ span: 9, offset: 2 }}
                wrapperCol={{ span: 13 }}
                required={false}
              >
                {getFieldDecorator('location_id', {
                  rules: [
                    {
                      required: true,
                      message: 'Please provide Location',
                    },
                  ],
                })(
                  <Select
                    showSearch
                    placeholder={`Select Location`}
                    optionFilterProp="children"
                    onSelect={(value: any) => handleChange('location_id', value)}
                    filterOption={(input: any, option: any) =>
                      option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                    }
                  >
                    {props.locationList.map((location: ILocation) => (
                      <Option key={location.id} value={location.id}>
                        {location.name}
                      </Option>
                    ))}
                  </Select>,
                )}
              </Form.Item>
            </Col>
          </Row>

          <Row>
            <Col span={11}>
              <Form.Item
                label="Labour"
                labelAlign="left"
                colon={false}
                labelCol={{ span: 8 }}
                wrapperCol={{ span: 14 }}
                required={false}
              >
                {getFieldDecorator('labour_id', {
                  rules: [
                    {
                      required: true,
                      message: 'Please provide Labour',
                    },
                  ],
                })(
                  <Select
                    showSearch
                    disabled={state.sub_contractor_id ? false : true}
                    placeholder={`Select Labour (from sub-contractor)`}
                    optionFilterProp="children"
                    onSelect={(value: any) => handleChange('labour_id', value)}
                    filterOption={(input: any, option: any) =>
                      option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                    }
                  >
                    {props.labourList.map((labour: LabourModel) => (
                      <Option key={labour.id} value={labour.id}>
                        {labour.name}
                      </Option>
                    ))}
                  </Select>,
                )}
              </Form.Item>
            </Col>
          </Row>

          <CreateIETable handleChange={handleChange} />

          <div style={{ marginTop: '30px' }}>
            <Row>
              <Col span={20} style={{ alignSelf: 'right' }}>
                <Form.Item
                  label="Notes"
                  labelAlign="left"
                  colon={false}
                  labelCol={{ span: 4 }}
                  wrapperCol={{ span: 16 }}
                >
                  <TextArea
                    autoSize={{ minRows: 3, maxRows: 6 }}
                    name="notes"
                    onChange={e => handleChange('notes', e.target.value)}
                  />
                </Form.Item>
              </Col>
            </Row>
          </div>
        </Card>
        <Form.Item>
          <Button
            loading={props.isSubmitting}
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
  );
};

const mapStateToProps = (state: ConnectState) => ({
  isSubmitting: state.loading.effects['issueEntry/addIssueEntry'],
  subContractorList: state.subcontractors.subContractorsList,
  WBSList: state.wbs.WBSList,
  roleList: state.roles.roles,
  locationList: state.locations.locations,
  employeeList: state.employee.employees,
  labourList: state.labours.labourListBySubContractor,
  selectedIOW: state.issueEntry.selectedIOW,
});

const WrappedCreateIssueEntry = Form.create({ name: 'CreateIssueEntry' })(CreateIssueEntry);

export default connect(mapStateToProps)(WrappedCreateIssueEntry);
