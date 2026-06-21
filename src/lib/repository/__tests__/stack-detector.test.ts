import { describe, it, expect } from 'vitest'
import { detectStack } from '../stack-detector'
import { filesFrom, nextjsPrismaRepo, expressApiRepo, fastapiRepo } from './fixtures'

describe('detectStack', () => {
  it('detects a Next.js fullstack app with build/start commands', () => {
    const stack = detectStack(nextjsPrismaRepo())
    expect(stack.language).toBe('nodejs')
    expect(stack.framework).toBe('nextjs')
    expect(stack.appType).toBe('fullstack')
    expect(stack.buildCommand).toBe('next build')
    expect(stack.startCommand).toBe('next start')
    expect(stack.nodeVersion).toBe('20')
  })

  it('detects Prisma and a database driver', () => {
    const stack = detectStack(nextjsPrismaRepo())
    expect(stack.hasPrisma).toBe(true)
    expect(stack.hasDatabase).toBe(true)
  })

  it('resolves the package manager from the lockfile', () => {
    expect(detectStack(filesFrom({ 'package.json': '{}', 'yarn.lock': '' })).packageManager).toBe('yarn')
    expect(detectStack(filesFrom({ 'package.json': '{}', 'pnpm-lock.yaml': '' })).packageManager).toBe('pnpm')
    expect(detectStack(filesFrom({ 'package.json': '{}', 'package-lock.json': '' })).packageManager).toBe('npm')
  })

  it('detects an Express API', () => {
    const stack = detectStack(expressApiRepo())
    expect(stack.framework).toBe('express')
    expect(stack.appType).toBe('api')
    expect(stack.startCommand).toBeNull()
  })

  it('detects a Python FastAPI app with a database', () => {
    const stack = detectStack(fastapiRepo())
    expect(stack.language).toBe('python')
    expect(stack.framework).toBe('fastapi')
    expect(stack.appType).toBe('api')
    expect(stack.hasDatabase).toBe(true)
  })

  it('detects a Go Gin app', () => {
    const stack = detectStack(filesFrom({ 'go.mod': 'module x\nrequire github.com/gin-gonic/gin v1.9.0' }))
    expect(stack.language).toBe('go')
    expect(stack.framework).toBe('gin')
  })

  it('detects a Spring Boot app', () => {
    const stack = detectStack(filesFrom({ 'pom.xml': '<dependency>spring-boot-starter-web</dependency>' }))
    expect(stack.language).toBe('java')
    expect(stack.framework).toBe('spring-boot')
  })

  it('flags Dockerfile and infers database from docker-compose', () => {
    const stack = detectStack(filesFrom({
      'package.json': '{}',
      Dockerfile: 'FROM node:20',
      'docker-compose.yml': 'services:\n  db:\n    image: postgres:16',
    }))
    expect(stack.hasDockerfile).toBe(true)
    expect(stack.hasDatabase).toBe(true)
  })

  it('returns unknown for an unrecognised repo', () => {
    const stack = detectStack(filesFrom({ 'README.md': '# hello' }))
    expect(stack.language).toBe('unknown')
    expect(stack.framework).toBe('unknown')
  })
})
