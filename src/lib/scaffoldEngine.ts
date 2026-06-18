import {
  aiModesByScaffoldType,
  authDefaultByScaffoldType,
  loginEnabledByAnswer,
  pageSetByScaffoldType,
} from './scaffoldConfig'
import type { ProjectConfig, ScaffoldOutput } from '../types/scaffold'

export function deriveScaffoldOutput(config: ProjectConfig): ScaffoldOutput {
  const scaffoldType = config.scaffold_type
  const authDefaults = authDefaultByScaffoldType[scaffoldType]
  const loginRequested = loginEnabledByAnswer[config.needs_auth]

  const authEnabled = authDefaults.optional ? loginRequested : true

  return {
    scaffoldType,
    pageSet: [...pageSetByScaffoldType[scaffoldType]],
    aiModes: [...aiModesByScaffoldType[scaffoldType]],
    auth: {
      enabled: authEnabled,
      optional: authDefaults.optional,
      recipe: authEnabled ? authDefaults.recipe : null,
    },
  }
}
