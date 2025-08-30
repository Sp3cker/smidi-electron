export type DomainError = {
  message: string;
  code?: string;
  details?: Record<string, unknown>;
};

export type UserFriendlyError = {
  message: string;
  code?: string;
  recoverable: boolean;
};

// src/shared/dto/ConfigDTOs.ts

// Command DTOs (for requests)
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
  expansionDirectory: string;
  // Add other config properties as needed
};

// Database row type (matches what ConfigRepository returns)
export type ConfigRow = {
  key: string;
  value: string;
};

// Value Objects
export type ConfigKey = "expansionDirectory" | "otherConfigKeys";
