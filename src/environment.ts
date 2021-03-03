export interface Environment {
  id: string
  url?: string
  name: string
  description: string
}

export const getDefaultEnvironments = (): Environment[] => [
  {
    id: 'prd',
    name: 'production',
    description: 'The live, production environment'
  },
  {
    id: 'stg',
    name: 'staging',
    description: 'The staging environment'
  },
  {
    id: 'tst',
    name: 'test',
    description: 'The testing environment'
  },
  {
    id: 'dev',
    name: 'development',
    description: 'The development environment'
  }
]
