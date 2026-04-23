import { Card } from '@/components/ui/card';
import { Construction } from 'lucide-react';

interface Props {
  titleFr: string;
  titleAr: string;
  isAr: boolean;
}

export const StepPlaceholder = ({ titleFr, titleAr, isAr }: Props) => {
  return (
    <Card className="p-8 text-center space-y-3">
      <Construction className="h-10 w-10 mx-auto text-muted-foreground" />
      <h2 className="text-lg font-bold">{isAr ? titleAr : titleFr}</h2>
      <p className="text-sm text-muted-foreground max-w-md mx-auto">
        {isAr
          ? 'هذه الخطوة قيد التطوير. ستكون متاحة قريبًا.'
          : 'Cette étape est en cours de développement. Disponible prochainement.'}
      </p>
    </Card>
  );
};
