'use client';

import React, { useState } from 'react';
import { 
  CreditCard, 
  Settings, 
  Eye, 
  EyeOff, 
  Plus, 
  Edit2, 
  Trash2, 
  Check, 
  X,
  DollarSign,
  Smartphone,
  Wallet
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

interface PaymentGateway {
  id: string;
  name: string;
  type: 'card' | 'wallet' | 'bank' | 'crypto';
  icon: React.ComponentType<any>;
  enabled: boolean;
  configured: boolean;
  fees: string;
  description: string;
  config: {
    apiKey?: string;
    secretKey?: string;
    merchantId?: string;
    webhookUrl?: string;
  };
}

const initialGateways: PaymentGateway[] = [
  {
    id: 'stripe',
    name: 'Stripe',
    type: 'card',
    icon: CreditCard,
    enabled: true,
    configured: true,
    fees: '2.9% + $0.30',
    description: 'Accept credit cards, debit cards, and digital wallets',
    config: {
      apiKey: 'pk_test_***************',
      secretKey: 'sk_test_***************',
      webhookUrl: 'https://yoursite.com/webhook/stripe'
    }
  },
  {
    id: 'paypal',
    name: 'PayPal',
    type: 'wallet',
    icon: Wallet,
    enabled: true,
    configured: true,
    fees: '2.9% + $0.30',
    description: 'Accept PayPal payments and digital wallets',
    config: {
      merchantId: 'merchant_***************',
      apiKey: 'api_***************',
      webhookUrl: 'https://yoursite.com/webhook/paypal'
    }
  },
  {
    id: 'razorpay',
    name: 'Razorpay',
    type: 'card',
    icon: CreditCard,
    enabled: false,
    configured: false,
    fees: '2% + ₹2',
    description: 'Popular payment gateway for Indian market',
    config: {}
  },
  {
    id: 'square',
    name: 'Square',
    type: 'card',
    icon: CreditCard,
    enabled: false,
    configured: false,
    fees: '2.6% + $0.10',
    description: 'Square payment processing',
    config: {}
  },
  {
    id: 'apple-pay',
    name: 'Apple Pay',
    type: 'wallet',
    icon: Smartphone,
    enabled: true,
    configured: true,
    fees: '2.9% + $0.30',
    description: 'Accept Apple Pay payments',
    config: {
      merchantId: 'merchant.com.yoursite'
    }
  },
  {
    id: 'google-pay',
    name: 'Google Pay',
    type: 'wallet',
    icon: Smartphone,
    enabled: true,
    configured: true,
    fees: '2.9% + $0.30',
    description: 'Accept Google Pay payments',
    config: {
      merchantId: 'merchant_***************'
    }
  }
];

export default function PaymentsPage() {
  const [gateways, setGateways] = useState<PaymentGateway[]>(initialGateways);
  const [selectedGateway, setSelectedGateway] = useState<PaymentGateway | null>(null);
  const [showKeys, setShowKeys] = useState<{ [key: string]: boolean }>({});
  const [isConfiguring, setIsConfiguring] = useState(false);

  const toggleGateway = (id: string) => {
    setGateways(prev => prev.map(gateway => 
      gateway.id === id 
        ? { ...gateway, enabled: !gateway.enabled }
        : gateway
    ));
  };

  const getEnabledGateways = () => {
    return gateways.filter(gateway => gateway.enabled && gateway.configured);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'card': return CreditCard;
      case 'wallet': return Wallet;
      case 'bank': return DollarSign;
      case 'crypto': return DollarSign;
      default: return CreditCard;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'card': return 'bg-blue-500';
      case 'wallet': return 'bg-green-500';
      case 'bank': return 'bg-purple-500';
      case 'crypto': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  const toggleKeyVisibility = (key: string) => {
    setShowKeys(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleConfigureGateway = (gateway: PaymentGateway) => {
    setSelectedGateway(gateway);
    setIsConfiguring(true);
  };

  const saveGatewayConfig = () => {
    if (selectedGateway) {
      setGateways(prev => prev.map(gateway => 
        gateway.id === selectedGateway.id 
          ? { ...selectedGateway, configured: true }
          : gateway
      ));
      setIsConfiguring(false);
      setSelectedGateway(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Payment Gateways</h1>
          <p className="text-muted-foreground">
            Manage your payment processing options and configurations
          </p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              Add Gateway
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add Payment Gateway</DialogTitle>
              <DialogDescription>
                Choose a payment gateway to integrate with your application
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Gateway Type</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select gateway type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="stripe">Stripe</SelectItem>
                    <SelectItem value="paypal">PayPal</SelectItem>
                    <SelectItem value="square">Square</SelectItem>
                    <SelectItem value="razorpay">Razorpay</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button className="w-full">Add Gateway</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Active Gateways Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Check className="h-5 w-5 text-green-500" />
            Active Payment Methods
          </CardTitle>
          <CardDescription>
            Currently enabled payment gateways for your customers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {getEnabledGateways().map((gateway) => {
              const Icon = gateway.icon;
              return (
                <div key={gateway.id} className="flex items-center gap-3 p-3 border rounded-lg">
                  <div className={`p-2 rounded-lg ${getTypeColor(gateway.type)}`}>
                    <Icon className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{gateway.name}</div>
                    <div className="text-sm text-muted-foreground">{gateway.fees}</div>
                  </div>
                  <Badge variant="secondary" className="text-green-600">
                    Active
                  </Badge>
                </div>
              );
            })}
          </div>
          {getEnabledGateways().length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No active payment gateways. Enable and configure gateways below.
            </div>
          )}
        </CardContent>
      </Card>

      {/* All Gateways */}
      <div className="grid gap-6 lg:grid-cols-2">
        {gateways.map((gateway) => {
          const Icon = gateway.icon;
          return (
            <Card key={gateway.id} className="relative">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${getTypeColor(gateway.type)}`}>
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{gateway.name}</CardTitle>
                      <CardDescription>{gateway.description}</CardDescription>
                    </div>
                  </div>
                  <Switch
                    checked={gateway.enabled}
                    onCheckedChange={() => toggleGateway(gateway.id)}
                    disabled={!gateway.configured}
                  />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Processing Fee</span>
                  <span className="font-medium">{gateway.fees}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <div className="flex items-center gap-2">
                    {gateway.configured ? (
                      <Badge variant="secondary" className="text-green-600">
                        <Check className="mr-1 h-3 w-3" />
                        Configured
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-orange-600">
                        <Settings className="mr-1 h-3 w-3" />
                        Setup Required
                      </Badge>
                    )}
                  </div>
                </div>

                <Separator />

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleConfigureGateway(gateway)}
                    className="flex-1"
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    Configure
                  </Button>
                  {gateway.configured && (
                    <Button variant="outline" size="sm">
                      <Eye className="mr-2 h-4 w-4" />
                      Test
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Configuration Dialog */}
      <Dialog open={isConfiguring} onOpenChange={setIsConfiguring}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Configure {selectedGateway?.name}</DialogTitle>
            <DialogDescription>
              Enter your {selectedGateway?.name} API credentials and settings
            </DialogDescription>
          </DialogHeader>
          
          {selectedGateway && (
            <div className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="apiKey">API Key</Label>
                  <div className="relative">
                    <Input
                      id="apiKey"
                      type={showKeys.apiKey ? 'text' : 'password'}
                      value={selectedGateway.config.apiKey || ''}
                      onChange={(e) => setSelectedGateway({
                        ...selectedGateway,
                        config: { ...selectedGateway.config, apiKey: e.target.value }
                      })}
                      placeholder="Enter API key"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => toggleKeyVisibility('apiKey')}
                    >
                      {showKeys.apiKey ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="secretKey">Secret Key</Label>
                  <div className="relative">
                    <Input
                      id="secretKey"
                      type={showKeys.secretKey ? 'text' : 'password'}
                      value={selectedGateway.config.secretKey || ''}
                      onChange={(e) => setSelectedGateway({
                        ...selectedGateway,
                        config: { ...selectedGateway.config, secretKey: e.target.value }
                      })}
                      placeholder="Enter secret key"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => toggleKeyVisibility('secretKey')}
                    >
                      {showKeys.secretKey ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="merchantId">Merchant ID</Label>
                  <Input
                    id="merchantId"
                    value={selectedGateway.config.merchantId || ''}
                    onChange={(e) => setSelectedGateway({
                      ...selectedGateway,
                      config: { ...selectedGateway.config, merchantId: e.target.value }
                    })}
                    placeholder="Enter merchant ID"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="webhookUrl">Webhook URL</Label>
                  <Input
                    id="webhookUrl"
                    value={selectedGateway.config.webhookUrl || ''}
                    onChange={(e) => setSelectedGateway({
                      ...selectedGateway,
                      config: { ...selectedGateway.config, webhookUrl: e.target.value }
                    })}
                    placeholder="https://yoursite.com/webhook"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Test Mode</Label>
                <div className="flex items-center space-x-2">
                  <Switch id="testMode" defaultChecked />
                  <Label htmlFor="testMode" className="text-sm">
                    Enable test mode for development
                  </Label>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setIsConfiguring(false)}>
                  Cancel
                </Button>
                <Button onClick={saveGatewayConfig}>
                  Save Configuration
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Payment Button Demo */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Button Preview</CardTitle>
          <CardDescription>
            Preview how payment options will appear to your customers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-6 border-2 border-dashed border-muted rounded-lg">
              <h3 className="font-medium mb-4">Checkout - $99.99</h3>
              <div className="space-y-3">
                {getEnabledGateways().map((gateway) => {
                  const Icon = gateway.icon;
                  return (
                    <Button
                      key={gateway.id}
                      variant="outline"
                      className="w-full justify-start"
                      disabled
                    >
                      <Icon className="mr-3 h-4 w-4" />
                      Pay with {gateway.name}
                    </Button>
                  );
                })}
                {getEnabledGateways().length === 0 && (
                  <div className="text-center py-4 text-muted-foreground">
                    No payment methods available
                  </div>
                )}
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              This is how your payment buttons will appear on your website
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}