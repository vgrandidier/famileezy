
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Upload } from 'lucide-react';

const formSchema = z.object({
  firstName: z.string().min(1, 'Le prénom est requis'),
  lastName: z.string().min(1, 'Le nom est requis'),
  email: z.string().email('Email invalide').optional().or(z.literal('')),
  profile: z.enum(['parent', 'child']),
  profilePicture: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface FamilyMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (member: FormValues) => void;
  member: {
    firstName: string;
    lastName: string;
    email?: string;
    profile: 'parent' | 'child';
    profilePicture?: string;
  } | null;
}

const FamilyMemberDialog = ({
  open,
  onOpenChange,
  onSave,
  member,
}: FamilyMemberDialogProps) => {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: member || {
      firstName: '',
      lastName: '',
      email: '',
      profile: 'child',
      profilePicture: '',
    },
  });

  const handleSubmit = (values: FormValues) => {
    onSave(values);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {member ? 'Modifier un membre' : 'Ajouter un membre'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="flex justify-center">
              <div className="relative">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={form.watch('profilePicture')} />
                  <AvatarFallback className="bg-muted">
                    {form.watch('firstName')?.charAt(0) || ''}
                    {form.watch('lastName')?.charAt(0) || ''}
                  </AvatarFallback>
                </Avatar>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="absolute bottom-0 right-0 rounded-full"
                >
                  <Upload className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Prénom</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email (optionnel)</FormLabel>
                  <FormControl>
                    <Input {...field} type="email" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="profile"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Profil</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex space-x-4"
                    >
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <RadioGroupItem value="parent" />
                        </FormControl>
                        <FormLabel className="font-normal">Parent</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <RadioGroupItem value="child" />
                        </FormControl>
                        <FormLabel className="font-normal">Enfant</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Annuler
              </Button>
              <Button type="submit">
                {member ? 'Enregistrer' : 'Ajouter'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default FamilyMemberDialog;
