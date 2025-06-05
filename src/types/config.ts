export interface SecurityConfig {
  maxCommandLength: number;
  blockedCommands: string[];
  allowedCommands: string[];
  blockedArguments: string[];
  allowedPaths: string[];
  restrictWorkingDirectory: boolean;
  logCommands: boolean;
  maxHistorySize: number;
  commandTimeout: number;
  enableInjectionProtection: boolean;
}

export interface ShellConfig {
  enabled: boolean;
  command: string;
  args: string[];
  validatePath?: (dir: string) => boolean;
  blockedOperators?: string[]; // Added for shell-specific operator restrictions
}

export interface SVNRepository {
  url: string;
  username?: string;
  password?: string;
  workingCopy: string;
  description?: string;
}

export interface SVNConfig {
  enabled: boolean;
  defaultTimeout: number;
  svnExecutablePath: string;
  repositories: Record<string, SVNRepository>;
}

export interface SSHConnectionConfig {
  host: string;
  port: number;
  username: string;
  privateKeyPath?: string;
  password?: string;
  keepaliveInterval?: number;
  keepaliveCountMax?: number;
  readyTimeout?: number;
}

export interface SSHConfig {
  enabled: boolean;
  connections: Record<string, SSHConnectionConfig>;
  defaultTimeout: number;
  maxConcurrentSessions: number;
  keepaliveInterval: number;
  keepaliveCountMax: number;
  readyTimeout: number;
}

export interface ServerConfig {
  security: SecurityConfig;
  svn: SVNConfig;
  shells: {
    powershell: ShellConfig;
    cmd: ShellConfig;
    gitbash: ShellConfig;
  };
  ssh: SSHConfig;
}

export interface CommandHistoryEntry {
  command: string;
  output: string;
  timestamp: string;
  exitCode: number;
  connectionId?: string;
  repositoryId?: string;
}