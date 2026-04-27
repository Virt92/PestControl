import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Document, DocumentStatus, DocumentType } from '@/types'
import { api } from '@/services/api'

export const useDocumentsStore = defineStore('documents', () => {
  const documents = ref<Document[]>([])
  const loading = ref(false)

  const drafts = computed(() => documents.value.filter(d => d.status === 'draft'))
  const published = computed(() => documents.value.filter(d => d.status === 'published'))

  async function fetchAll() {
    loading.value = true
    try {
      documents.value = await api.get<Document[]>('/documents')
    } finally {
      loading.value = false
    }
  }

  function getById(id: string): Document | undefined {
    return documents.value.find(d => d.id === id)
  }

  function getByObjectId(objectId: string): Document[] {
    return documents.value.filter(d => d.objectId === objectId)
  }

  async function add(data: Omit<Document, 'id' | 'createdAt' | 'updatedAt'>) {
    const doc = await api.post<Document>('/documents', data)
    documents.value.unshift(doc)
    return doc
  }

  async function update(id: string, data: Partial<Document>) {
    const updated = await api.put<Document>(`/documents/${id}`, data)
    const idx = documents.value.findIndex(d => d.id === id)
    if (idx !== -1) documents.value[idx] = updated
    return updated
  }

  async function publish(id: string) {
    return update(id, { status: 'published', publishedAt: new Date().toISOString() })
  }

  async function remove(id: string) {
    await api.delete(`/documents/${id}`)
    documents.value = documents.value.filter(d => d.id !== id)
  }

  function search(query: string, objectId?: string, type?: DocumentType, status?: DocumentStatus): Document[] {
    const q = query.toLowerCase()
    return documents.value.filter(d => {
      const matchesQuery = !q || d.title.toLowerCase().includes(q)
      const matchesObject = !objectId || d.objectId === objectId
      const matchesType = !type || d.type === type
      const matchesStatus = !status || d.status === status
      return matchesQuery && matchesObject && matchesType && matchesStatus
    })
  }

  return { documents, loading, drafts, published, getById, getByObjectId, fetchAll, add, update, publish, remove, search }
})
