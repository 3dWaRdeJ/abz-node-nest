import * as React from "react";
import {Box, Text, BasePropertyProps, Label} from "admin-bro";
import {EmployeeEntity} from "../../../employee/employee.entity";

const List = (props) => {
  const {record} = props

  const srcImg = "/img/" + record.params['id'] + '/' + record.params['photo_path'];
  const name = record.params['full_name'];
  return (
    <Box><img src={record.params['photo_path'] ?? '/img/default.png'} width="60px"/>{name}</Box>
  )
}

export default List;
