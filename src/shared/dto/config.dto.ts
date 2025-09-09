import { DomainError } from "./index";
export type UpdateConfigCommand = {
  key: string;
  value: string;
};

export type GetConfigQuery = {
  // No payload needed, but could include filters if needed
};

export type ConfigResponse =
  | {
      success: true;
      data: ConfigData;
    }
  | {
      success: false;
      error: DomainError;
    };

export type ConfigData = {
  isValid: boolean;
  expansionDir: string;
  // Add other config properties as needed
};

// Database row type (matches what ConfigRepository returns)
export type ConfigRow = {
  key: string;
  value: string;
};

// Value Objects
export type ConfigKey = "expansionDirectory" | "otherConfigKeys";
