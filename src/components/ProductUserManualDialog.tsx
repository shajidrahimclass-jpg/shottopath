import { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/db/supabase';
import { useAuth } from '@/contexts/AuthContext';
import type { Product } from '@/types';
import { FileText } from 'lucide-react';

interface ProductUserManualDialogProps {
  product: Product;
  open: boolean;
  onAccept: () => void;
  onCancel?: () => void;
  pageSource?: string;
}

export function ProductUserManualDialog({
  product,
  open,
  onAccept,
  onCancel,
  pageSource = 'unknown',
}: ProductUserManualDialogProps) {
  const { user } = useAuth();
  const [agreed, setAgreed] = useState(false);
  const [saving, setSaving] = useState(false);

  // Reset checkbox when dialog opens
  useEffect(() => {
    if (open) {
      setAgreed(false);
    }
  }, [open]);

  // Check if user already accepted this product's manual — skip dialog if so
  useEffect(() => {
    if (!open || !user || !product?.id) return;

    const checkAcceptance = async () => {
      const { data } = await (supabase
        .from('product_manual_acceptances')
        .select('id')
        .eq('user_id', user.id)
        .eq('product_id', product.id)
        .maybeSingle() as any);

      if (data) {
        // Already accepted — skip dialog and proceed directly
        onAccept();
      }
    };

    checkAcceptance();
  }, [open, user, product?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const saveAcceptance = useCallback(async () => {
    if (!user || !product?.id) return;

    const insertData = {
      user_id: user.id,
      product_id: product.id,
      page_source: pageSource,
    };

    // @ts-ignore — new table not yet in generated Supabase types
    await supabase.from('product_manual_acceptances').insert([insertData]);
  }, [user, product?.id, pageSource]);

  const handleAccept = async () => {
    if (!agreed) return;
    setSaving(true);
    await saveAcceptance();
    setSaving(false);
    setAgreed(false);
    onAccept();
  };

  const handleClose = () => {
    if (onCancel) onCancel();
    setAgreed(false);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen && onCancel) handleClose();
    }}>
      <DialogContent
        className="max-w-[calc(100%-2rem)] md:max-w-2xl max-h-[90vh]"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl text-balance">
            <FileText className="h-6 w-6 text-primary shrink-0" />
            {product.name} - User Manual
          </DialogTitle>
          <DialogDescription>
            Please read the product user manual carefully before proceeding
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[50vh] pr-4">
          <div className="space-y-4 text-sm whitespace-pre-wrap">
            {product.user_manual}
          </div>
        </ScrollArea>

        <div className="flex items-start space-x-2 p-4 bg-muted/50 rounded-lg">
          <Checkbox
            id="agree"
            checked={agreed}
            onCheckedChange={(checked) => setAgreed(checked as boolean)}
          />
          <Label
            htmlFor="agree"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
          >
            I have read and understood the product user manual
          </Label>
        </div>

        <DialogFooter className="gap-2">
          {onCancel && (
            <Button
              variant="outline"
              onClick={handleClose}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
          )}
          <Button
            onClick={handleAccept}
            disabled={!agreed || saving}
            className="w-full sm:w-auto"
          >
            {saving ? 'Saving...' : 'Accept and Continue'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
