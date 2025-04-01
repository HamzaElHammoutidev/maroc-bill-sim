
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { InfoIcon, CheckCircle, HelpCircle, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface MoroccanInvoiceRequirementsProps {
  invoiceType?: 'standard' | 'credit-note' | 'proforma' | 'deposit';
  onCopyText?: (text: string) => void;
}

const MoroccanInvoiceRequirements: React.FC<MoroccanInvoiceRequirementsProps> = ({
  invoiceType = 'standard',
  onCopyText
}) => {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const [expanded, setExpanded] = useState<string | undefined>(undefined);

  const requirements = {
    standard: [
      {
        id: 'vendor',
        title: t('legal.vendor_info'),
        description: t('legal.vendor_info_desc'),
        details: [
          t('legal.vendor_name'),
          t('legal.vendor_address'),
          t('legal.vendor_ice'),
          t('legal.vendor_if'),
          t('legal.vendor_rc'),
          t('legal.vendor_cnss'),
          t('legal.vendor_patente'),
        ]
      },
      {
        id: 'client',
        title: t('legal.client_info'),
        description: t('legal.client_info_desc'),
        details: [
          t('legal.client_name'),
          t('legal.client_address'),
          t('legal.client_ice'),
        ]
      },
      {
        id: 'document',
        title: t('legal.document_info'),
        description: t('legal.document_info_desc'),
        details: [
          t('legal.invoice_date'),
          t('legal.invoice_number'),
          t('legal.delivery_date'),
          t('legal.payment_terms'),
        ]
      },
      {
        id: 'taxes',
        title: t('legal.tax_info'),
        description: t('legal.tax_info_desc'),
        details: [
          t('legal.tax_rates'),
          t('legal.tax_amounts'),
          t('legal.totals'),
        ]
      },
      {
        id: 'payment',
        title: t('legal.payment_info'),
        description: t('legal.payment_info_desc'),
        details: [
          t('legal.payment_method'),
          t('legal.payment_deadline'),
          t('legal.penalty_clause'),
          t('legal.invoice_valid_time'),
        ]
      }
    ],
    'credit-note': [
      {
        id: 'vendor',
        title: t('legal.vendor_info'),
        description: t('legal.vendor_info_desc'),
        details: [
          t('legal.vendor_name'),
          t('legal.vendor_address'),
          t('legal.vendor_ice'),
          t('legal.vendor_if'),
          t('legal.vendor_rc'),
        ]
      },
      {
        id: 'client',
        title: t('legal.client_info'),
        description: t('legal.client_info_desc'),
        details: [
          t('legal.client_name'),
          t('legal.client_address'),
          t('legal.client_ice'),
        ]
      },
      {
        id: 'credit-note',
        title: t('legal.credit_note_info'),
        description: t('legal.credit_note_info_desc'),
        details: [
          t('legal.credit_note_label'),
          t('legal.credit_note_reason'),
          t('legal.original_invoice_ref'),
          t('legal.issue_date'),
        ]
      },
    ],
    'proforma': [
      {
        id: 'proforma',
        title: t('legal.proforma_mention'),
        description: t('legal.proforma_mention_desc'),
        details: [
          t('legal.proforma_label'),
          t('legal.proforma_expiry'),
          t('legal.proforma_validity'),
        ]
      },
    ],
    'deposit': [
      {
        id: 'deposit',
        title: t('legal.deposit_mention'),
        description: t('legal.deposit_mention_desc'),
        details: [
          t('legal.deposit_label'),
          t('legal.deposit_remaining'),
          t('legal.deposit_percentage'),
          t('legal.deposit_final_invoice'),
        ]
      },
    ]
  };

  const defaultTexts = {
    standard: t('legal.standard_default_text'),
    'credit-note': t('legal.credit_note_default_text'),
    'proforma': t('legal.proforma_default_text'),
    'deposit': t('legal.deposit_default_text'),
  };

  const handleCopy = (text: string) => {
    if (onCopyText) {
      onCopyText(text);
    } else {
      navigator.clipboard.writeText(text);
      toast({
        title: t('common.copied'),
        description: t('legal.text_copied_to_clipboard'),
      });
    }
  };

  // Get the appropriate requirements list based on invoice type
  const typedRequirements = [...requirements[invoiceType], ...requirements.standard.filter(req => 
    !requirements[invoiceType].some(typeReq => typeReq.id === req.id)
  )];

  return (
    <Card className="border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <InfoIcon className="h-5 w-5 text-blue-500" />
          {t(`legal.${invoiceType}_requirements`)}
        </CardTitle>
        <CardDescription>
          {t(`legal.${invoiceType}_requirements_desc`)}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible>
          {typedRequirements.map((section, index) => (
            <AccordionItem key={section.id} value={section.id}>
              <AccordionTrigger>
                <div className="flex items-center gap-2">
                  {section.title}
                  {index === 0 && (
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                      {t('legal.required')}
                    </span>
                  )}
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="text-sm text-muted-foreground mb-2">
                  {section.description}
                </div>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  {section.details.map((detail, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>
          ))}
          <AccordionItem value="default-text">
            <AccordionTrigger>
              {t('legal.suggested_text')}
            </AccordionTrigger>
            <AccordionContent>
              <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md border text-sm whitespace-pre-line">
                {defaultTexts[invoiceType]}
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-2"
                onClick={() => handleCopy(defaultTexts[invoiceType])}
              >
                <Copy className="h-4 w-4 mr-2" />
                {t('common.copy_text')}
              </Button>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
      <CardFooter className="flex justify-between border-t pt-4">
        <div className="flex items-center text-sm text-muted-foreground">
          <HelpCircle className="h-4 w-4 mr-2" />
          {t('legal.regulations_notice')}
        </div>
        <Button variant="link" size="sm" className="text-sm px-0">
          {t('legal.more_info')}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default MoroccanInvoiceRequirements;
