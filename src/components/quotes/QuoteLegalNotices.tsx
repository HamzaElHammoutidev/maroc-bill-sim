import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Pencil, Check, RefreshCw, FileText } from 'lucide-react';
import { legalNotices } from '@/config/moroccoConfig';

interface QuoteLegalNoticesProps {
  customNotices?: string;
  onNoticesChange: (notices: string) => void;
  readOnly?: boolean;
}

const QuoteLegalNotices: React.FC<QuoteLegalNoticesProps> = ({
  customNotices,
  onNoticesChange,
  readOnly = false
}) => {
  const { t, i18n } = useTranslation();
  const [editing, setEditing] = useState(false);
  const [tempNotices, setTempNotices] = useState<string>(customNotices || '');
  
  // Use standard legal notices from config if no custom notices are provided
  const standardNotices = Object.values(legalNotices[i18n.language]).join('\n\n');
  const displayNotices = customNotices || standardNotices;
  
  const handleEdit = () => {
    setTempNotices(displayNotices);
    setEditing(true);
  };
  
  const handleSave = () => {
    onNoticesChange(tempNotices);
    setEditing(false);
  };
  
  const handleCancel = () => {
    setEditing(false);
  };
  
  const applyStandardNotices = () => {
    setTempNotices(standardNotices);
    onNoticesChange(standardNotices);
    setEditing(false);
  };
  
  return (
    <Card className="border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-md">{t('quotes.legal_notices')}</CardTitle>
          </div>
          {!readOnly && !editing && (
            <Button variant="ghost" size="sm" onClick={handleEdit}>
              <Pencil className="h-4 w-4 mr-2" />
              {t('quotes.edit_legal_notices')}
            </Button>
          )}
        </div>
        <CardDescription>
          {editing ? t('quotes.customize_notices') : ''}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {editing ? (
          <Textarea 
            value={tempNotices}
            onChange={(e) => setTempNotices(e.target.value)}
            rows={8}
            className="resize-none"
          />
        ) : (
          <div className="whitespace-pre-line text-sm text-muted-foreground">
            {displayNotices}
          </div>
        )}
      </CardContent>
      {editing && (
        <CardFooter className="flex justify-between">
          <div>
            <Button variant="outline" size="sm" onClick={applyStandardNotices}>
              <RefreshCw className="h-4 w-4 mr-2" />
              {t('quotes.apply_standard_notices')}
            </Button>
          </div>
          <div className="space-x-2">
            <Button variant="outline" size="sm" onClick={handleCancel}>
              {t('form.cancel')}
            </Button>
            <Button size="sm" onClick={handleSave}>
              <Check className="h-4 w-4 mr-2" />
              {t('form.save')}
            </Button>
          </div>
        </CardFooter>
      )}
    </Card>
  );
};

export default QuoteLegalNotices; 