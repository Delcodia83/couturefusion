import React, { useState } from 'react';
import { toast } from 'sonner';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { orderPaymentService } from 'utils/subscriptionService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

interface OrderPaymentFormProps {
  orderId: string;
  clientId: string;
  tailorId: string;
  initialPaymentStatus?: boolean;
  initialPaymentAmount?: number;
  initialPaymentNote?: string;
  onPaymentUpdated?: (success: boolean) => void;
}

const formSchema = z.object({
  paymentReceived: z.boolean(),
  paymentAmount: z.coerce.number().min(0, "Le montant doit être positif"),
  paymentNote: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export const OrderPaymentForm = ({
  orderId,
  clientId,
  tailorId,
  initialPaymentStatus = false,
  initialPaymentAmount = 0,
  initialPaymentNote = "",
  onPaymentUpdated
}: OrderPaymentFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Initialiser le formulaire avec zod validator
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      paymentReceived: initialPaymentStatus,
      paymentAmount: initialPaymentAmount,
      paymentNote: initialPaymentNote,
    }
  });
  
  const paymentReceived = form.watch('paymentReceived');
  
  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    
    try {
      const success = await orderPaymentService.updateOrderPaymentStatus({
        orderId,
        clientId,
        tailorId,
        paymentReceived: values.paymentReceived,
        paymentAmount: values.paymentAmount,
        paymentNote: values.paymentNote,
      });
      
      if (success) {
        toast.success(values.paymentReceived 
          ? 'Paiement marqué comme reçu avec succès' 
          : 'Statut de paiement mis à jour avec succès');
        
        if (onPaymentUpdated) {
          onPaymentUpdated(true);
        }
      } else {
        toast.error('Erreur lors de la mise à jour du statut de paiement');
        if (onPaymentUpdated) {
          onPaymentUpdated(false);
        }
      }
    } catch (error) {
      console.error('Error updating payment status:', error);
      toast.error('Erreur lors de la mise à jour du statut de paiement');
      if (onPaymentUpdated) {
        onPaymentUpdated(false);
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Gérer le paiement</CardTitle>
        <CardDescription>
          Vous pouvez indiquer manuellement si vous avez reçu le paiement pour cette commande.
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="paymentReceived"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">
                      Paiement reçu
                    </FormLabel>
                    <FormDescription>
                      Indiquez si vous avez reçu le paiement pour cette commande.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="paymentAmount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Montant reçu (XOF)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      {...field} 
                      min="0"
                      placeholder="Montant en XOF" 
                      disabled={!paymentReceived}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="paymentNote"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Note (optionnelle)</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Détails sur le paiement, méthode, date, etc."
                      rows={3}
                    />
                  </FormControl>
                  <FormDescription>
                    Ajoutez des informations complémentaires sur ce paiement.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? "Mise à jour..." : "Enregistrer les modifications"}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
};
