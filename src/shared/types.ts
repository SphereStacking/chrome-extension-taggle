export type CalendarItem = {
  id: string
  name: string
}

export type TagItem = {
  id: string
  name: string
  color: string
  calendarIds: string[]
}

export type StoragePayload = {
  tags: TagItem[]
  updatedAt: number
}
