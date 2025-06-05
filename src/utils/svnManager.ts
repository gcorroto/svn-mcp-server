import fs from 'fs';
import path from 'path';
import { loadConfig } from './config.js';
import type { SVNRepository } from '../types/config.js';

let cachedConfig: any = null;

function getConfig() {
  if (!cachedConfig) {
    cachedConfig = loadConfig();
  }
  return cachedConfig;
}

export function readSVNRepositories(): Record<string, SVNRepository> {
  const config = getConfig();
  return config.svn?.repositories || {};
}

export function createSVNRepository(repositoryId: string, repositoryConfig: SVNRepository): void {
  const config = getConfig();
  
  if (!config.svn) {
    throw new Error('SVN is not enabled in configuration');
  }

  // Add the new repository to the config
  config.svn.repositories[repositoryId] = repositoryConfig;
  
  // Update cached config
  cachedConfig = config;
  
  console.error(`SVN repository '${repositoryId}' created successfully`);
}

export function updateSVNRepository(repositoryId: string, repositoryConfig: SVNRepository): void {
  const config = getConfig();
  
  if (!config.svn?.repositories[repositoryId]) {
    throw new Error(`SVN repository '${repositoryId}' not found`);
  }

  // Update the repository config
  config.svn.repositories[repositoryId] = repositoryConfig;
  
  // Update cached config
  cachedConfig = config;
  
  console.error(`SVN repository '${repositoryId}' updated successfully`);
}

export function deleteSVNRepository(repositoryId: string): void {
  const config = getConfig();
  
  if (!config.svn?.repositories[repositoryId]) {
    throw new Error(`SVN repository '${repositoryId}' not found`);
  }

  // Remove the repository from config
  delete config.svn.repositories[repositoryId];
  
  // Update cached config
  cachedConfig = config;
  
  console.error(`SVN repository '${repositoryId}' deleted successfully`);
}

export function getSVNRepository(repositoryId: string): SVNRepository {
  const repositories = readSVNRepositories();
  const repository = repositories[repositoryId];
  
  if (!repository) {
    throw new Error(`SVN repository '${repositoryId}' not found`);
  }
  
  return repository;
}

export function buildSVNCommand(baseCommand: string, repositoryId?: string): string {
  if (!repositoryId) {
    return baseCommand;
  }
  
  const repository = getSVNRepository(repositoryId);
  let command = baseCommand;
  
  // Add authentication if provided
  if (repository.username) {
    command += ` --username "${repository.username}"`;
    if (repository.password) {
      command += ` --password "${repository.password}"`;
    }
  }
  
  // Add non-interactive flag for automated operations
  command += ' --non-interactive';
  
  return command;
}

export function validateSVNWorkingCopy(workingCopyPath: string): boolean {
  const svnDir = path.join(workingCopyPath, '.svn');
  return fs.existsSync(svnDir) && fs.statSync(svnDir).isDirectory();
}

export function getSVNExecutablePath(): string {
  const config = getConfig();
  return config.svn?.svnExecutablePath || 'svn';
} 