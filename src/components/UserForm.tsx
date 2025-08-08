
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserPlus } from "lucide-react";
import { sanitizeInput, validateEmail, validatePassword } from "@/utils/sanitize";
import { useToast } from "@/hooks/use-toast";

interface UserFormData {
  email: string;
  name: string;
  role: 'admin' | 'gestor_almoxarifado' | 'supervisor_geral';
  password: string;
}

interface UserFormProps {
  onSubmit: (data: UserFormData) => Promise<{ success: boolean }>;
}

export function UserForm({ onSubmit }: UserFormProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<UserFormData>({
    email: '',
    name: '',
    role: 'gestor_almoxarifado',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Security: Sanitize all inputs
    const sanitizedData = {
      email: sanitizeInput(formData.email.toLowerCase()),
      name: sanitizeInput(formData.name),
      role: formData.role, // Role is from select, already safe
      password: formData.password, // Don't sanitize password as it may contain special chars
    };
    
    // Validate email format
    if (!validateEmail(sanitizedData.email)) {
      toast({
        title: "Erro de validação",
        description: "Email inválido",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }
    
    // Validate password strength
    const passwordValidation = validatePassword(sanitizedData.password);
    if (!passwordValidation.isValid) {
      toast({
        title: "Erro de validação",
        description: passwordValidation.message,
        variant: "destructive",
      });
      setLoading(false);
      return;
    }
    
    const result = await onSubmit(sanitizedData);
    
    if (result.success) {
      setFormData({ email: '', name: '', role: 'gestor_almoxarifado', password: '' });
      setOpen(false);
    }
    
    setLoading(false);
  };

  const handleInputChange = (field: keyof UserFormData, value: string) => {
    // Apply basic sanitization on input change
    const sanitizedValue = field === 'password' ? value : sanitizeInput(value);
    setFormData(prev => ({ ...prev, [field]: sanitizedValue }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <UserPlus className="h-4 w-4 mr-2" />
          Novo Usuário
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md" aria-describedby="user-form-description">
        <DialogHeader>
          <DialogTitle>Novo Usuário</DialogTitle>
        </DialogHeader>
        <div id="user-form-description" className="sr-only">
          Formulário para criar um novo usuário no sistema
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="name">Nome</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              required
              maxLength={100}
            />
          </div>

          <div>
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              required
              minLength={8}
              placeholder="Mínimo 8 caracteres com letras e números"
            />
          </div>
          
          <div>
            <Label htmlFor="role">Função</Label>
            <Select 
              value={formData.role}
              onValueChange={(value) => setFormData(prev => ({ ...prev, role: value as 'admin' | 'gestor_almoxarifado' | 'supervisor_geral' }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione a função" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Administrador</SelectItem>
                <SelectItem value="gestor_almoxarifado">Gestor Almoxarifado</SelectItem>
                <SelectItem value="supervisor_geral">Supervisor Geral</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Criando..." : "Criar Usuário"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
