
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Shield, 
  Heart, 
  Info,
  Calendar,
  User,
  Building
} from "lucide-react";

export default function Settings() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-primary rounded-lg">
          <div className="flex items-center gap-1">
            <Shield className="h-5 w-5 text-white" />
            <Heart className="h-5 w-5 text-white" />
          </div>
        </div>
        <div>
          <h1 className="text-3xl font-bold">Configurações</h1>
          <p className="text-muted-foreground">
            Informações sobre o sistema
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* System Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              Informações do Sistema
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="font-medium">Nome do Sistema:</span>
              <span>Sistema de Almoxarifado</span>
            </div>
            <Separator />
            <div className="flex justify-between items-center">
              <span className="font-medium">Versão:</span>
              <Badge variant="secondary">v1.0.0</Badge>
            </div>
            <Separator />
            <div className="flex justify-between items-center">
              <span className="font-medium">Departamento:</span>
              <span>Divisão de Endemias</span>
            </div>
            <Separator />
            <div className="flex justify-between items-center">
              <span className="font-medium">Tipo:</span>
              <span>Gestão de Estoque</span>
            </div>
          </CardContent>
        </Card>

        {/* Organization Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Organização
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="font-medium">Setor:</span>
              <span>Saúde Pública</span>
            </div>
            <Separator />
            <div className="flex justify-between items-center">
              <span className="font-medium">Divisão:</span>
              <span>Endemias</span>
            </div>
            <Separator />
            <div className="flex justify-between items-center">
              <span className="font-medium">Função:</span>
              <span>Controle de Almoxarifado</span>
            </div>
          </CardContent>
        </Card>

        {/* Development Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Desenvolvimento
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="font-medium">Desenvolvedor:</span>
              <span>Elissandro Oliveira</span>
            </div>
            <Separator />
            <div className="flex justify-between items-center">
              <span className="font-medium">Ano:</span>
              <span>2025</span>
            </div>
            <Separator />
            <div className="flex justify-between items-center">
              <span className="font-medium">Status:</span>
              <Badge variant="default">Ativo</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Release Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Informações da Versão
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="font-medium">Data de Lançamento:</span>
              <span>Janeiro 2025</span>
            </div>
            <Separator />
            <div className="flex justify-between items-center">
              <span className="font-medium">Última Atualização:</span>
              <span>16/01/2025</span>
            </div>
            <Separator />
            <div className="flex justify-between items-center">
              <span className="font-medium">Ambiente:</span>
              <Badge variant="outline">Produção</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Footer Information */}
      <Card>
        <CardContent className="pt-6">
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              Sistema desenvolvido especificamente para a Divisão de Endemias
            </p>
            <p className="text-xs text-muted-foreground">
              Copyright © 2025. Desenvolvido por Elissandro Oliveira. Todos os direitos reservados.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
