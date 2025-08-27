'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Copy, ExternalLink, Users, Calendar, Link, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useUsers, InviteLink } from '@/contexts/UsersContext';
import { cn } from '@/lib/utils';

const inviteSchema = z.object({
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  roleId: z.string().min(1, 'Role is required'),
  maxUses: z.number().min(1).max(100),
  expiresIn: z.number().min(1).max(365),
  message: z.string().optional(),
});

type InviteFormData = z.infer<typeof inviteSchema>;

interface InviteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const InviteDialog: React.FC<InviteDialogProps> = ({
  open,
  onOpenChange,
}) => {
  const { createInviteLink, inviteLinks, roles } = useUsers();
  const [activeTab, setActiveTab] = useState('create');
  const [generatedLink, setGeneratedLink] = useState<string>('');
  const [copied, setCopied] = useState(false);

  const form = useForm<InviteFormData>({
    resolver: zodResolver(inviteSchema),
    defaultValues: {
      email: '',
      roleId: '',
      maxUses: 1,
      expiresIn: 7,
      message: '',
    },
  });

  const handleCreateInvite = async (data: InviteFormData) => {
    try {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + data.expiresIn);

      const invite = await createInviteLink({
        email: data.email || undefined,
        roleId: data.roleId,
        maxUses: data.maxUses,
        expiresAt,
      });

      const inviteUrl = `${window.location.origin}/auth/register?invite=${invite.code}`;
      setGeneratedLink(inviteUrl);
      setActiveTab('generated');
      
      // Reset form
      form.reset();
    } catch (error) {
      console.error('Failed to create invite:', error);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  const generateNewLink = () => {
    setGeneratedLink('');
    setActiveTab('create');
  };

  const getRoleName = (roleId: string) => {
    return roles.find(r => r.id === roleId)?.name || 'Unknown Role';
  };

  const formatExpiryDate = (date: Date) => {
    return new Date(date).toLocaleDateString();
  };

  const isExpired = (date: Date) => {
    return new Date(date) < new Date();
  };

  const isFullyUsed = (invite: InviteLink) => {
    return invite.maxUses && invite.currentUses >= invite.maxUses;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Invite Users</DialogTitle>
          <DialogDescription>
            Create invite links to add new users to your system
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="create">Create Invite</TabsTrigger>
            <TabsTrigger value="generated">Generated Links</TabsTrigger>
          </TabsList>

          <TabsContent value="create" className="space-y-4">
            <form onSubmit={form.handleSubmit(handleCreateInvite)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address (Optional)</Label>
                <Input
                  id="email"
                  type="email"
                  {...form.register('email')}
                  placeholder="user@example.com"
                />
                <p className="text-sm text-muted-foreground">
                  Leave empty to create a general invite link
                </p>
              </div>

              <div className="space-y-2">
                <Label>Role *</Label>
                <Select value={form.watch('roleId')} onValueChange={(value) => form.setValue('roleId', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role.id} value={role.id}>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          {role.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.roleId && (
                  <p className="text-sm text-red-500">{form.formState.errors.roleId.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="maxUses">Maximum Uses</Label>
                  <Input
                    id="maxUses"
                    type="number"
                    {...form.register('maxUses', { valueAsNumber: true })}
                    min="1"
                    max="100"
                  />
                  {form.formState.errors.maxUses && (
                    <p className="text-sm text-red-500">{form.formState.errors.maxUses.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expiresIn">Expires In (Days)</Label>
                  <Input
                    id="expiresIn"
                    type="number"
                    {...form.register('expiresIn', { valueAsNumber: true })}
                    min="1"
                    max="365"
                  />
                  {form.formState.errors.expiresIn && (
                    <p className="text-sm text-red-500">{form.formState.errors.expiresIn.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Personal Message (Optional)</Label>
                <Textarea
                  id="message"
                  {...form.register('message')}
                  placeholder="Add a personal message to the invitation..."
                  rows={3}
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? 'Creating...' : 'Create Invite Link'}
                </Button>
              </DialogFooter>
            </form>
          </TabsContent>

          <TabsContent value="generated" className="space-y-4">
            {generatedLink && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Link className="h-5 w-5" />
                    New Invite Link Generated
                  </CardTitle>
                  <CardDescription>
                    Share this link with the person you want to invite
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Input value={generatedLink} readOnly className="flex-1" />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(generatedLink)}
                    >
                      <Copy className="h-4 w-4" />
                      {copied ? 'Copied!' : 'Copy'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(generatedLink, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4" />
                      Open
                    </Button>
                  </div>
                  <Button onClick={generateNewLink} variant="outline" className="w-full">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Generate Another Link
                  </Button>
                </CardContent>
              </Card>
            )}

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Recent Invite Links</h3>
                <Badge variant="secondary">{inviteLinks.length} total</Badge>
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto">
                {inviteLinks.map((invite) => (
                  <Card key={invite.id} className={cn(
                    "transition-colors",
                    (!invite.isActive || isExpired(invite.expiresAt) || isFullyUsed(invite)) && "opacity-60"
                  )}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-mono text-sm bg-muted px-2 py-1 rounded">
                              {invite.code}
                            </span>
                            <Badge variant={invite.isActive ? "default" : "secondary"}>
                              {invite.isActive ? "Active" : "Inactive"}
                            </Badge>
                            {isExpired(invite.expiresAt) && (
                              <Badge variant="destructive">Expired</Badge>
                            )}
                            {isFullyUsed(invite) && (
                              <Badge variant="destructive">Used Up</Badge>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground space-y-1">
                            <div className="flex items-center gap-2">
                              <Users className="h-3 w-3" />
                              {getRoleName(invite.roleId)}
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-3 w-3" />
                              Expires: {formatExpiryDate(invite.expiresAt)}
                            </div>
                            <div className="flex items-center gap-2">
                              <Mail className="h-3 w-3" />
                              {invite.email || 'General invite'}
                            </div>
                            <div className="flex items-center gap-2">
                              <span>Uses: {invite.currentUses}/{invite.maxUses || '∞'}</span>
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(`${window.location.origin}/auth/register?invite=${invite.code}`)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}; 