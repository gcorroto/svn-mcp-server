# SVN MCP Server
[![NPM Downloads](https://img.shields.io/npm/dt/@greco/svn-mcp-server.svg?style=flat)](https://www.npmjs.com/package/@greco/svn-mcp-server)
[![NPM Version](https://img.shields.io/npm/v/@greco/svn-mcp-server.svg?style=flat)](https://www.npmjs.com/package/@greco/svn-mcp-server?activeTab=versions)
[![smithery badge](https://smithery.ai/badge/@greco/svn-mcp-server)](https://smithery.ai/server/@greco/svn-mcp-server)

[MCP server](https://modelcontextprotocol.io/introduction) for secure SVN (Subversion) operations on Windows systems, enabling controlled access to SVN repositories and version control operations. It allows MCP clients (like [Claude Desktop](https://claude.ai/download)) to perform SVN operations on your system with enhanced security and repository management.

>[!IMPORTANT]
> This MCP server provides direct access to your SVN repositories and file system. When enabled, it grants access to your SVN working copies, repository configurations, and command execution capabilities.
>
> - Review and restrict allowed paths and SVN repositories
> - Enable directory restrictions
> - Configure allowed SVN commands
> - Consider security implications
>
> See [Configuration](#configuration) for more details.

- [Features](#features)
- [Usage with Claude Desktop](#usage-with-claude-desktop)
- [Configuration](#configuration)
  - [Configuration Locations](#configuration-locations)
  - [Default Configuration](#default-configuration)
  - [Configuration Settings](#configuration-settings)
    - [Security Settings](#security-settings)
    - [SVN Configuration](#svn-configuration)
    - [Shell Configuration](#shell-configuration)
- [API](#api)
  - [Tools](#tools)
  - [Resources](#resources)
- [Security Considerations](#security-considerations)
- [License](#license)

## Features

- **SVN Operations**: Execute SVN commands (checkout, update, commit, status, etc.)
- **Repository Management**: Configure and manage multiple SVN repositories
- **Security Controls**:
  - Allowed SVN commands only (svn, svnadmin, svnversion, etc.)
  - Command and argument blocking
  - Working directory validation
  - Maximum command length limits
  - Command logging and history tracking
  - Authentication management per repository
- **Resource Exposure**: View SVN repositories, configurations, and current directory as MCP resources
- **Configurable**:
  - Custom security rules
  - SVN repository profiles
  - Path restrictions
  - Repository-specific authentication

See the [API](#api) section for more details on the tools and resources the server provides to MCP clients.

**Note**: The server will only allow SVN operations within configured directories and repositories, with allowed SVN commands only.

## Usage with Claude Desktop

Add this to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "svn-server": {
      "command": "npx",
      "args": ["-y", "@greco/svn-mcp-server"]
    }
  }
}
```

For use with a specific config file, add the `--config` flag:

```json
{
  "mcpServers": {
    "svn-server": {
      "command": "npx",
      "args": [
        "-y",
        "@greco/svn-mcp-server",
        "--config",
        "path/to/your/config.json"
      ]
    }
  }
}
```

After configuring, you can:
- Execute SVN commands directly using the available tools
- View configured SVN repositories and server configuration in the Resources section
- Manage SVN repositories through the provided tools

## Configuration

The server uses a JSON configuration file to customize its behavior. You can specify settings for security controls, SVN repositories, and shell configurations.

1. To create a default config file, either:

**a)** copy `config.sample.json` to `config.json`, or

**b)** run:

```bash
npx @greco/svn-mcp-server --init-config ./config.json
```

2. Then set the `--config` flag to point to your config file as described in the [Usage with Claude Desktop](#usage-with-claude-desktop) section.

### Configuration Locations

The server looks for configuration in the following locations (in order):

1. Path specified by `--config` flag
2. ./config.json in current directory
3. ~/.svn-mcp/config.json in user's home directory

If no configuration file is found, the server will use a default (restricted) configuration:

### Default Configuration

**Note**: The default configuration is designed to be restrictive and secure. Find more details on each setting in the [Configuration Settings](#configuration-settings) section.

```json
{
  "security": {
    "maxCommandLength": 2000,
    "blockedCommands": [
      "format",
      "shutdown",
      "restart",
      "reg",
      "regedit",
      "net",
      "netsh",
      "takeown",
      "icacls"
    ],
    "allowedCommands": [
      "svn",
      "svnadmin",
      "svnversion",
      "svnlook",
      "svndumpfilter",
      "svnsync"
    ],
    "blockedArguments": [
      "--exec",
      "-e",
      "/c",
      "-enc",
      "-encodedcommand",
      "-command",
      "--interactive",
      "-i",
      "--login",
      "--system"
    ],
    "allowedPaths": ["User's home directory", "Current working directory"],
    "restrictWorkingDirectory": true,
    "logCommands": true,
    "maxHistorySize": 1000,
    "commandTimeout": 60,
    "enableInjectionProtection": true
  },
  "svn": {
    "enabled": true,
    "defaultTimeout": 60,
    "svnExecutablePath": "svn",
    "repositories": {}
  },
  "shells": {
    "powershell": {
      "enabled": false,
      "command": "powershell.exe",
      "args": ["-NoProfile", "-NonInteractive", "-Command"],
      "blockedOperators": ["&", "|", ";", "`"]
    },
    "cmd": {
      "enabled": true,
      "command": "cmd.exe",
      "args": ["/c"],
      "blockedOperators": ["&", "|", ";", "`"]
    },
    "gitbash": {
      "enabled": false,
      "command": "C:\\Program Files\\Git\\bin\\bash.exe",
      "args": ["-c"],
      "blockedOperators": ["&", "|", ";", "`"]
    }
  },
  "ssh": {
    "enabled": false,
    "defaultTimeout": 30,
    "maxConcurrentSessions": 5,
    "keepaliveInterval": 10000,
    "keepaliveCountMax": 3,
    "readyTimeout": 20000,
    "connections": {}
  }
}
```

### Configuration Settings

The configuration file is divided into four main sections: `security`, `svn`, `shells`, and `ssh`.

#### Security Settings

```json
{
  "security": {
    // Maximum allowed length for any command
    "maxCommandLength": 2000,

    // Commands to block - blocks both direct use and full paths
    // Example: "format" blocks both "format" and "C:\\Windows\\System32\\format.exe"
    // Case-insensitive: "del" blocks "DEL.EXE", "del.cmd", etc.
    "blockedCommands": [
      "format", // Format disks
      "shutdown", // Shutdown system
      "restart", // Restart system
      "reg", // Registry editor
      "regedit", // Registry editor
      "net", // Network commands
      "netsh", // Network commands
      "takeown", // Take ownership of files
      "icacls" // Change file permissions
    ],

    // Commands that are explicitly allowed - if this list is provided, only these commands can be executed
    // This provides a whitelist approach for maximum security
    "allowedCommands": [
      "svn", // SVN client
      "svnadmin", // SVN administration
      "svnversion", // SVN version info
      "svnlook", // SVN repository inspection
      "svndumpfilter", // SVN dump filtering
      "svnsync" // SVN synchronization
    ],

    // Arguments that will be blocked when used with any command
    // Note: Checks each argument independently
    "blockedArguments": [
      "--exec", // Execution flags
      "-e", // Short execution flags
      "/c", // Command execution in some shells
      "-enc", // PowerShell encoded commands
      "-encodedcommand", // PowerShell encoded commands
      "-command", // Direct PowerShell command execution
      "--interactive", // Interactive mode which might bypass restrictions
      "-i", // Short form of interactive
      "--login", // Login shells might have different permissions
      "--system" // System level operations
    ],

    // List of directories where commands can be executed
    "allowedPaths": ["C:\\Users\\YourUsername", "C:\\Projects", "C:\\SVN"],

    // If true, commands can only run in allowedPaths
    "restrictWorkingDirectory": true,

    // If true, saves command history
    "logCommands": true,

    // Maximum number of commands to keep in history
    "maxHistorySize": 1000,

    // Timeout for command execution in seconds (default: 60)
    "commandTimeout": 60,

    // Enable or disable protection against command injection (covers ;, &, |, \`)
    "enableInjectionProtection": true
  }
}
```

#### SVN Configuration

```json
{
  "svn": {
    // Enable/disable SVN functionality
    "enabled": true,

    // Default timeout for SVN commands in seconds
    "defaultTimeout": 60,

    // Path to SVN executable (can be just "svn" if in PATH)
    "svnExecutablePath": "svn",

    // SVN repository configurations
    "repositories": {
      // Example repository configuration
      "main-project": {
        "url": "https://svn.example.com/repo/trunk",
        "username": "your-username",
        "password": "your-password",
        "workingCopy": "C:\\Projects\\main-project",
        "description": "Main project repository"
      },
      // Repository without password (will prompt or use stored credentials)
      "library": {
        "url": "https://svn.company.com/libs/trunk",
        "username": "developer",
        "workingCopy": "C:\\Projects\\library"
      }
    }
  }
}
```

#### Shell Configuration

```json
{
  "shells": {
    "powershell": {
      // Enable/disable this shell
      "enabled": false,
      // Path to shell executable
      "command": "powershell.exe",
      // Default arguments for the shell
      "args": ["-NoProfile", "-NonInteractive", "-Command"],
      // Optional: Specify which command operators to block
      "blockedOperators": ["&", "|", ";", "`"]  // Block all command chaining
    },
    "cmd": {
      "enabled": true,
      "command": "cmd.exe",
      "args": ["/c"],
      "blockedOperators": ["&", "|", ";", "`"]  // Block all command chaining
    },
    "gitbash": {
      "enabled": false,
      "command": "C:\\Program Files\\Git\\bin\\bash.exe",
      "args": ["-c"],
      "blockedOperators": ["&", "|", ";", "`"]  // Block all command chaining
    }
  }
}
```

#### SSH Configuration

```json
{
  "ssh": {
    // Enable/disable SSH functionality
    "enabled": false,

    // Default timeout for SSH commands in seconds
    "defaultTimeout": 30,

    // Maximum number of concurrent SSH sessions
    "maxConcurrentSessions": 5,

    // Interval for sending keepalive packets (in milliseconds)
    "keepaliveInterval": 10000,

    // Maximum number of failed keepalive attempts before disconnecting
    "keepaliveCountMax": 3,

    // Timeout for establishing SSH connections (in milliseconds)
    "readyTimeout": 20000,

    // SSH connection profiles
    "connections": {
      // NOTE: these examples are not set in the default config!
      // Example: Local Raspberry Pi
      "raspberry-pi": {
        "host": "raspberrypi.local", // Hostname or IP address
        "port": 22, // SSH port
        "username": "pi", // SSH username
        "password": "raspberry", // Password authentication (if not using key)
        "keepaliveInterval": 10000, // Override global keepaliveInterval
        "keepaliveCountMax": 3, // Override global keepaliveCountMax
        "readyTimeout": 20000 // Override global readyTimeout
      },
      // Example: Remote server with key authentication
      "dev-server": {
        "host": "dev.example.com",
        "port": 22,
        "username": "admin",
        "privateKeyPath": "C:\\Users\\YourUsername\\.ssh\\id_rsa", // Path to private key
        "keepaliveInterval": 10000,
        "keepaliveCountMax": 3,
        "readyTimeout": 20000
      }
    }
  }
}
```

## API

### Tools

- **execute_command**

  - Execute a command in the specified shell
  - Inputs:
    - `shell` (string): Shell to use ("powershell", "cmd", or "gitbash")
    - `command` (string): Command to execute
    - `workingDir` (optional string): Working directory
  - Returns command output as text, or error message if execution fails

- **get_command_history**

  - Get the history of executed commands
  - Input: `limit` (optional number)
  - Returns timestamped command history with outputs

- **ssh_execute**

  - Execute a command on a remote system via SSH
  - Inputs:
    - `connectionId` (string): ID of the SSH connection to use
    - `command` (string): Command to execute
  - Returns command output as text, or error message if execution fails

- **ssh_disconnect**
  - Disconnect from an SSH server
  - Input:
    - `connectionId` (string): ID of the SSH connection to disconnect
  - Returns confirmation message

- **create_ssh_connection**
  - Create a new SSH connection
  - Inputs:
    - `connectionId` (string): ID for the new SSH connection
    - `connectionConfig` (object): Connection configuration details including host, port, username, and either password or privateKeyPath
  - Returns confirmation message

- **read_ssh_connections**
  - Read all configured SSH connections
  - Returns a list of all SSH connections from the configuration

- **update_ssh_connection**
  - Update an existing SSH connection
  - Inputs:
    - `connectionId` (string): ID of the SSH connection to update
    - `connectionConfig` (object): New connection configuration details
  - Returns confirmation message

- **delete_ssh_connection**
  - Delete an SSH connection
  - Input:
    - `connectionId` (string): ID of the SSH connection to delete
  - Returns confirmation message

- **get_current_directory**
  - Get the current working directory of the server
  - Returns the current working directory path

### Resources

- **SVN Repositories**
  - URI format: `svn://{repositoryId}`
  - Contains repository details with sensitive information masked
  - One resource for each configured SVN repository
  - Example: `svn://main-project` shows configuration for the "main-project" repository

- **SVN Configuration**
  - URI: `svn://config`
  - Contains overall SVN configuration and all repositories (with passwords masked)
  - Shows settings like defaultTimeout, svnExecutablePath, and the list of repositories

- **SSH Connections**
  - URI format: `ssh://{connectionId}`
  - Contains connection details with sensitive information masked
  - One resource for each configured SSH connection
  - Example: `ssh://raspberry-pi` shows configuration for the "raspberry-pi" connection

- **SSH Configuration**
  - URI: `ssh://config`
  - Contains overall SSH configuration and all connections (with passwords masked)
  - Shows settings like defaultTimeout, maxConcurrentSessions, and the list of connections

- **Current Directory**
  - URI: `cli://currentdir`
  - Contains the current working directory of the SVN MCP server
  - Shows the path where commands will execute by default

- **SVN MCP Server Configuration**
  - URI: `cli://config`
  - Contains the SVN MCP server configuration (excluding sensitive data)
  - Shows security settings, SVN settings, shell configurations, and SSH settings

## Security Considerations

### Built-in Security Features (Always Active)

The following security features are hard-coded into the server and cannot be disabled:

- **Case-insensitive command blocking**: All command blocking is case-insensitive (e.g., "DEL.EXE", "del.cmd", etc. are all blocked if "del" is in blockedCommands)
- **Smart path parsing**: The server parses full command paths to prevent bypass attempts (blocking "C:\\Windows\\System32\\rm.exe" if "rm" is blocked)
- **Command parsing intelligence**: False positives are avoided (e.g., "warm_dir" is not blocked just because "rm" is in blockedCommands)
- **Input validation**: All user inputs are validated before execution
- **Shell process management**: Processes are properly terminated after execution or timeout
- **Sensitive data masking**: Passwords are automatically masked in resources (replaced with ********)

### Configurable Security Features (Active by Default)

These security features are configurable through the config.json file:

- **Command blocking**: Commands specified in `blockedCommands` array are blocked (default includes dangerous commands like rm, del, format)
- **Argument blocking**: Arguments specified in `blockedArguments` array are blocked (default includes potentially dangerous flags)
- **Command injection protection**: Prevents command chaining (enabled by default through `enableInjectionProtection: true`)
- **Working directory restriction**: Limits command execution to specified directories (enabled by default through `restrictWorkingDirectory: true`)
- **Command length limit**: Restricts maximum command length (default: 2000 characters)
- **Command timeout**: Terminates commands that run too long (default: 30 seconds)
- **Command logging**: Records command history (enabled by default through `logCommands: true`)

### Important Security Warnings

These are not features but important security considerations to be aware of:

- **Environment access**: Commands may have access to environment variables, which could contain sensitive information
- **File system access**: Commands can read/write files within allowed paths - carefully configure `allowedPaths` to prevent access to sensitive data

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
