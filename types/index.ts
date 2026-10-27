export interface CaptchaResponse {
  captcha: string;
  salt: string;
}

export interface LoginPayload {
  username: string;
  password: string;
  salt: string;
  captcha_answer: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface TaskCreatePayload {
  title: string;
  description?: string;
  completed?: boolean;
}

export interface TaskReplacePayload {
  title: string;
  description: string;
  completed: boolean;
}

export type TaskPatchPayload = Partial<TaskReplacePayload>;

export interface TaskFilters {
  q?: string;
  completed?: boolean;
}

export type CalculatorOperation = "add" | "subtract" | "multiply" | "divide";