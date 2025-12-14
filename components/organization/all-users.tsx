"use client"

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { type User } from "@/prisma/client/client";
import { Button } from "@/components/ui/button";
import { Card } from "../ui/card";

export function AllUsers({ users }: { users: User[] }) {
  return (
    <div>
      <h2 className="text-2xl font-bold font-averia">All Users</h2>
      <Card className="p-4 max-w-2/4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>{user.name}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                <Button
                  variant="outline"
                  className="ml-2"
                  onClick={() =>console.log("adicionado")}
                >
                  Adicionar
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      </Card>
    </div>
  );
}