export type MeDetailType = {
  userId: number;
  username: string;
  created_at: Date;
  first_name: string;
  last_name: string;
  department: string;
  branch: Branch;
  employee: Employee;
  designation: Designation;
};

export type Branch = {
  branch_id: number;
  branch_code: string;
  branch_name: string;
};

export type Designation = {
  designation_code: string;
  designation_name: string;
};

export type Employee = {
  employee_code: string;
  employee_id: number;
  joined_at: Date;
};

export type BranchType = {
  id: number;
  branch_code: string;
  branch_name: string;
  phone: string;
  coordinate: Coordinate;
};

export type Coordinate = {
  x: number;
  y: number;
};
