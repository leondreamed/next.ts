import type { UserWith } from '~/types/shorthands/user.server.js'

export interface ClientActor extends UserWith<{ $actorData: true }> {}
