
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Users, Shield, UserCog, Trash2 } from "lucide-react";
import { UserForm } from "@/components/UserForm";
import { useUsers } from "@/hooks/useUsers";
import { useAuth } from "@/hooks/useAuth";

export default function UsersPage() {
  const { users, loading, createUser, updateUser, deleteUser } = useUsers();
  const { userProfile } = useAuth();

  const handleCreateUser = async (data: { email: string; name: string; role: 'admin' | 'gestor_almoxarifado' }) => {
    return await createUser(data.email, data.name, data.role);
  };

  const handleToggleActive = async (userId: string, isActive: boolean) => {
    await updateUser(userId, { is_active: isActive });
  };

  const handleDeleteUser = async (userId: string) => {
    if (confirm('Tem certeza que deseja remover este usuário?')) {
      await deleteUser(userId);
    }
  };

  const getRoleBadge = (role: string) => {
    return role === 'admin' ? 
      <Badge variant="destructive" className="flex items-center gap-1">
        <Shield className="h-3 w-3" />
        Administrador
      </Badge> :
      <Badge variant="secondary" className="flex items-center gap-1">
        <UserCog className="h-3 w-3" />
        Gestor Almoxarifado
      </Badge>;
  };

  // Check if current user is admin
  if (!userProfile || userProfile.role !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <Shield className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2">Acesso Restrito</h2>
            <p className="text-muted-foreground">
              Você não tem permissão para acessar esta página.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Usuários</h1>
          <p className="text-muted-foreground">
            Gerenciar usuários e permissões do sistema
          </p>
        </div>
        <UserForm onSubmit={handleCreateUser} />
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Total de Usuários</p>
                <p className="text-2xl font-bold">{users.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-destructive" />
              <div>
                <p className="text-sm text-muted-foreground">Administradores</p>
                <p className="text-2xl font-bold">
                  {users.filter(u => u.role === 'admin').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <UserCog className="h-5 w-5 text-secondary" />
              <div>
                <p className="text-sm text-muted-foreground">Gestores</p>
                <p className="text-2xl font-bold">
                  {users.filter(u => u.role === 'gestor_almoxarifado').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Usuários</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Carregando usuários...</div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Função</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Criado em</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">
                        {user.name || 'Sem nome'}
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{getRoleBadge(user.role)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={user.is_active}
                            onCheckedChange={(checked) => handleToggleActive(user.id, checked)}
                            disabled={user.id === userProfile?.id} // Can't disable own account
                          />
                          <span className="text-sm">
                            {user.is_active ? 'Ativo' : 'Inativo'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(user.created_at).toLocaleDateString('pt-BR')}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteUser(user.id)}
                          disabled={user.id === userProfile?.id} // Can't delete own account
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
