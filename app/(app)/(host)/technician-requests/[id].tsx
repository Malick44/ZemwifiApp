import { Ionicons } from '@expo/vector-icons'
import { useLocalSearchParams, useRouter } from 'expo-router'
import React, { useEffect, useRef, useState } from 'react'
import { ActionSheetIOS, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TouchableOpacity, useColorScheme, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Colors } from '../../../../constants/theme'
import { Badge } from '../../../../src/components/ui/Badge'
import { BottomSheet } from '../../../../src/components/ui/BottomSheet'
import { Button } from '../../../../src/components/ui/Button'
import { Card } from '../../../../src/components/ui/Card'
import { Message } from '../../../../src/components/ui/Message'
import { MessageInput } from '../../../../src/components/ui/MessageInput'
import { TextField } from '../../../../src/components/ui/TextField'
import { Typography } from '../../../../src/components/ui/Typography'
import { useMessageStore } from '../../../../src/stores/messageStore'
import { RequestPriority, useTechnicianRequestStore } from '../../../../src/stores/technicianRequestStore'

export default function TechnicianRequestDetailScreen() {
  const router = useRouter()
  const { id } = useLocalSearchParams<{ id: string }>()
  const colorScheme = useColorScheme()
  const colors = Colors[colorScheme ?? 'light']

  const { fetchRequestById, updateRequest, cancelRequest, loading: reqLoading } = useTechnicianRequestStore()
  const { messages, fetchMessages, sendMessage, loading: msgLoading, refresh: refreshMessages } = useMessageStore()

  const [request, setRequest] = useState<any>(null)
  const [activeTab, setActiveTab] = useState<'details' | 'messages'>('details')
  const [showEditSheet, setShowEditSheet] = useState(false)
  const [showCancelSheet, setShowCancelSheet] = useState(false)
  const [cancelReason, setCancelReason] = useState('')
  const [editForm, setEditForm] = useState<{
    subject: string
    description: string
    priority: RequestPriority
  }>({ subject: '', description: '', priority: 'medium' })
  const scrollViewRef = useRef<ScrollView>(null)

  useEffect(() => {
    loadData()
  }, [id])

  useEffect(() => {
    if (activeTab === 'messages' && id) {
      fetchMessages(id)
      const interval = setInterval(() => refreshMessages(), 10000) // Poll for messages
      return () => clearInterval(interval)
    }
  }, [activeTab, id])

  const loadData = async () => {
    if (!id) return
    const req = await fetchRequestById(id)
    setRequest(req)
    if (req) {
      setEditForm({
        subject: req.subject,
        description: req.description,
        priority: (req.priority as RequestPriority) || 'medium'
      })
    }
  }

  const handleUpdate = async () => {
    if (!id || !request) return
    try {
      await updateRequest(id, editForm)
      setShowEditSheet(false)
      loadData()
      Alert.alert('Succès', 'La demande a été mise à jour')
    } catch (_error) {
      Alert.alert('Erreur', 'Impossible de mettre à jour la demande')
    }
  }

  const handleCancel = async () => {
    if (!id || !cancelReason.trim()) {
      Alert.alert('Erreur', 'Veuillez indiquer un motif d\'annulation')
      return
    }

    Alert.alert(
      'Confirmer l\'annulation',
      'Êtes-vous sûr de vouloir annuler cette demande ?',
      [
        { text: 'Retour', style: 'cancel' },
        {
          text: 'Annuler la demande',
          style: 'destructive',
          onPress: async () => {
            try {
              await cancelRequest(id, cancelReason)
              setShowCancelSheet(false)
              loadData()
              Alert.alert('Succès', 'La demande a été annulée')
            } catch (_error) {
              Alert.alert('Erreur', 'Impossible d\'annuler la demande')
            }
          }
        }
      ]
    )
  }

  const handleSendMessage = async (text: string) => {
    if (!id) return
    try {
      await sendMessage(id, text)
      // Auto scroll to bottom handled by layout change
    } catch (_error) {
      Alert.alert('Erreur', 'Échec de l\'envoi du message')
    }
  }

  const showActions = () => {
    if (!request) return

    // Only allow edit/cancel for non-completed/cancelled requests
    if (['completed', 'cancelled', 'rejected'].includes(request.status)) {
      Alert.alert('Info', 'Cette demande est clôturée et ne peut plus être modifiée.')
      return
    }

    const options = ['Modifier la demande', 'Annuler la demande', 'Annuler']
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options,
          cancelButtonIndex: 2,
          destructiveButtonIndex: 1,
        },
        (buttonIndex) => {
          if (buttonIndex === 0) setShowEditSheet(true)
          if (buttonIndex === 1) setShowCancelSheet(true)
        }
      )
    } else {
      Alert.alert('Actions', 'Que voulez-vous faire ?', [
        { text: 'Modifier', onPress: () => setShowEditSheet(true) },
        { text: 'Annuler la demande', onPress: () => setShowCancelSheet(true), style: 'destructive' },
        { text: 'Retour', style: 'cancel' },
      ])
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'warning'
      case 'assigned': return 'info'
      case 'accepted': return 'primary'
      case 'in_progress': return 'primary'
      case 'completed': return 'success'
      case 'cancelled': return 'neutral'
      case 'rejected': return 'error'
      default: return 'neutral'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'En attente'
      case 'assigned': return 'Assigné'
      case 'accepted': return 'Accepté'
      case 'in_progress': return 'En cours'
      case 'completed': return 'Terminé'
      case 'cancelled': return 'Annulé'
      case 'rejected': return 'Rejeté'
      default: return status
    }
  }

  if (!request) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <Typography variant="body" color="textSecondary">Chargement...</Typography>
      </View>
    )
  }

  // Calculate if edit allowed (only pending/assigned)
  const canEdit = ['pending', 'assigned'].includes(request.status)

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Typography variant="h3" style={{ flex: 1, textAlign: 'center' }}>
          {activeTab === 'details' ? 'Détails Demande' : 'Messages'}
        </Typography>
        <TouchableOpacity onPress={showActions} style={styles.actionButton}>
          <Ionicons name="ellipsis-horizontal" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'details' && { borderBottomColor: colors.primary }]}
          onPress={() => setActiveTab('details')}
        >
          <Typography
            variant="body"
            style={{ fontWeight: activeTab === 'details' ? '700' : '400', color: activeTab === 'details' ? colors.primary : colors.textSecondary }}
          >
            Détails
          </Typography>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'messages' && { borderBottomColor: colors.primary }]}
          onPress={() => setActiveTab('messages')}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Typography
              variant="body"
              style={{ fontWeight: activeTab === 'messages' ? '700' : '400', color: activeTab === 'messages' ? colors.primary : colors.textSecondary }}
            >
              Messages
            </Typography>
            {request.has_unread_messages && activeTab !== 'messages' && (
              <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: colors.error }} />
            )}
          </View>
        </TouchableOpacity>
      </View>

      {activeTab === 'details' ? (
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.statusSection}>
            <Typography variant="h2" style={styles.title}>{request.subject}</Typography>
            <View style={styles.badges}>
              <Badge variant={getStatusColor(request.status) as any}>
                {getStatusLabel(request.status)}
              </Badge>
              <Typography variant="caption" color="textSecondary">
                Créé le {new Date(request.created_at).toLocaleDateString()}
              </Typography>
            </View>

            {request.priority && (
              <View style={{ marginTop: 8, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Ionicons name="flag" size={14} color={
                  request.priority === 'high' ? colors.error :
                    request.priority === 'medium' ? colors.warning : colors.success
                } />
                <Typography variant="caption" color="textSecondary" style={{ textTransform: 'capitalize' }}>
                  Priorité {request.priority === 'low' ? 'Basse' : request.priority === 'medium' ? 'Moyenne' : 'Haute'}
                </Typography>
              </View>
            )}
          </View>

          <Card variant="filled" style={styles.descCard}>
            <Typography variant="label" style={{ marginBottom: 4 }}>Description</Typography>
            <Typography variant="body">{request.description}</Typography>
          </Card>

          {request.cancel_reason && (
            <Card variant="outlined" style={[styles.descCard, { borderColor: colors.error }]}>
              <Typography variant="label" color="error" style={{ marginBottom: 4 }}>Motif d&apos;annulation</Typography>
              <Typography variant="body">{request.cancel_reason}</Typography>
            </Card>
          )}

          <Typography variant="h4" style={styles.sectionTitle}>Intervenant</Typography>
          {request.technician_name ? (
            <Card variant="outlined" style={styles.techCard}>
              <View style={styles.techAvatar}>
                <Typography variant="h4" color="primary">
                  {request.technician_name.split(' ').map((n: string) => n[0]).join('')}
                </Typography>
              </View>
              <View style={styles.techInfo}>
                <Typography variant="body" weight="bold">{request.technician_name}</Typography>
                <Typography variant="caption" color="textSecondary">{request.technician_phone}</Typography>
              </View>
              <TouchableOpacity style={[styles.callBtn, { backgroundColor: colors.success }]}>
                <Ionicons name="call" size={20} color="white" />
              </TouchableOpacity>
            </Card>
          ) : (
            <Card variant="outlined" style={styles.techCard}>
              <View style={[styles.techAvatar, { backgroundColor: colors.backgroundSecondary }]}>
                <Ionicons name="person-outline" size={24} color={colors.textSecondary} />
              </View>
              <View style={styles.techInfo}>
                <Typography variant="body" color="textSecondary">En attente d&apos;assignation...</Typography>
              </View>
            </Card>
          )}

          <Typography variant="h4" style={styles.sectionTitle}>Suivi</Typography>
          <View style={styles.timeline}>
            {/* Simple timeline based on status history - could be enhanced */}
            <View style={styles.timelineItem}>
              <View style={styles.timelineIndicator}>
                <View style={[styles.dot, { backgroundColor: colors.primary }]} />
                <View style={[styles.line, { backgroundColor: colors.border }]} />
              </View>
              <View style={styles.timelineContent}>
                <Typography variant="body">Demande créée</Typography>
                <Typography variant="caption" color="textSecondary">{new Date(request.created_at).toLocaleString()}</Typography>
              </View>
            </View>

            {request.updated_at !== request.created_at && (
              <View style={styles.timelineItem}>
                <View style={styles.timelineIndicator}>
                  <View style={[styles.dot, { backgroundColor: request.status === 'completed' ? colors.success : colors.warning }]} />
                </View>
                <View style={styles.timelineContent}>
                  <Typography variant="body">
                    {request.status === 'completed' ? 'Intervention terminée' :
                      request.status === 'cancelled' ? 'Demande annulée' :
                        request.status === 'in_progress' ? 'Intervention en cours' :
                          'Dernière mise à jour'}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">{new Date(request.updated_at).toLocaleString()}</Typography>
                </View>
              </View>
            )}
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      ) : (
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ flex: 1 }}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        >
          <ScrollView
            ref={scrollViewRef}
            contentContainerStyle={styles.messagesContent}
            onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
          >
            {msgLoading && messages.length === 0 ? (
              <ActivityIndicator style={{ marginTop: 20 }} />
            ) : messages.length === 0 ? (
              <View style={styles.emptyMessages}>
                <Typography variant="body" color="textSecondary" style={{ textAlign: 'center' }}>
                  Aucun message.{'\n'}Écrivez ci-dessous pour contacter le technicien.
                </Typography>
              </View>
            ) : (
              messages.map((msg) => (
                <Message
                  key={msg.id}
                  message={msg}
                  isOwn={msg.sender_type === 'host'}
                />
              ))
            )}
          </ScrollView>
          <MessageInput onSend={handleSendMessage} loading={msgLoading} />
        </KeyboardAvoidingView>
      )}

      {/* Edit Bottom Sheet */}
      <BottomSheet
        visible={showEditSheet}
        onClose={() => setShowEditSheet(false)}
        title="Modifier la demande"
        snapPoint={0.8}
      >
        <ScrollView style={{ padding: 20 }}>
          {!canEdit && (
            <View style={{ padding: 12, backgroundColor: colors.warning + '20', borderRadius: 8, marginBottom: 16 }}>
              <Typography variant="caption" color="warning">
                Seules les demandes en attente ou assignées peuvent être modifiées complètement.
              </Typography>
            </View>
          )}

          <View style={{ marginBottom: 20 }}>
            <TextField
              label="Sujet"
              value={editForm.subject}
              onChangeText={(t) => setEditForm(prev => ({ ...prev, subject: t }))}
              editable={canEdit}
            />
          </View>

          <View style={{ marginBottom: 20 }}>
            <TextField
              label="Description"
              value={editForm.description}
              onChangeText={(t) => setEditForm(prev => ({ ...prev, description: t }))}
              multiline
              numberOfLines={4}
              style={{ height: 100, textAlignVertical: 'top' }}
            />
          </View>

          <View style={{ marginBottom: 20 }}>
            <Typography variant="label" style={{ marginBottom: 8 }}>Priorité</Typography>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              {['low', 'medium', 'high'].map((p) => (
                <TouchableOpacity
                  key={p}
                  style={[
                    styles.priorityBtn,
                    {
                      borderColor: editForm.priority === p ? colors.primary : colors.border,
                      backgroundColor: editForm.priority === p ? colors.primary + '10' : 'transparent'
                    }
                  ]}
                  onPress={() => setEditForm(prev => ({ ...prev, priority: p as any }))}
                >
                  <Typography variant="body" style={{ color: editForm.priority === p ? colors.primary : colors.text }}>
                    {p === 'low' ? 'Basse' : p === 'medium' ? 'Moyenne' : 'Haute'}
                  </Typography>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <Button onPress={handleUpdate} loading={reqLoading}>
            Enregistrer les modifications
          </Button>
          <View style={{ height: 40 }} />
        </ScrollView>
      </BottomSheet>

      {/* Cancel Bottom Sheet */}
      <BottomSheet
        visible={showCancelSheet}
        onClose={() => setShowCancelSheet(false)}
        title="Annuler la demande"
        snapPoint={0.5}
      >
        <View style={{ padding: 20 }}>
          <Typography variant="body" style={{ marginBottom: 16 }}>
            Veuillez indiquer la raison de l&apos;annulation. Cette action est irréversible.
          </Typography>

          <TextField
            label="Raison de l&apos;annulation"
            placeholder="Ex: Problème résolu, Technicien absent..."
            value={cancelReason}
            onChangeText={setCancelReason}
            multiline
            numberOfLines={3}
          />

          <View style={{ height: 20 }} />

          <Button
            style={{ backgroundColor: colors.error }}
            onPress={handleCancel}
            loading={reqLoading}
          >
            Confirmer l&apos;annulation
          </Button>
        </View>
      </BottomSheet>

    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 8,
  },
  actionButton: {
    padding: 8,
  },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  content: {
    padding: 24,
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 20,
    flexGrow: 1,
  },
  emptyMessages: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 100,
  },
  statusSection: {
    marginBottom: 24,
  },
  title: {
    marginBottom: 8,
  },
  badges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  descCard: {
    marginBottom: 32,
    padding: 16,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  techCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 32,
  },
  techAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0,0,0,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  techInfo: {
    flex: 1,
  },
  callBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timeline: {
    marginBottom: 32,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 0,
  },
  timelineIndicator: {
    alignItems: 'center',
    marginRight: 16,
    width: 16,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  line: {
    width: 2,
    flex: 1,
    minHeight: 30,
    marginTop: 4,
  },
  timelineContent: {
    flex: 1,
    paddingBottom: 24,
  },
  priorityBtn: {
    flex: 1,
    padding: 10,
    borderWidth: 1,
    borderRadius: 8,
    alignItems: 'center',
  },
})
