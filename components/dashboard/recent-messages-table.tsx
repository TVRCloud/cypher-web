"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/_ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Eye, Ban, MessageSquareOff } from "lucide-react";

type MessageStatus = "delivered" | "pending" | "failed" | "blocked";

interface RecentMessage {
  id: string;
  user: string;
  username: string;
  initials: string;
  text: string;
  command?: string;
  time: string;
  status: MessageStatus;
  chatType: "private" | "group" | "channel";
}

const messages: RecentMessage[] = [
  {
    id: "1",
    user: "Alex Mercer",
    username: "@alexm",
    initials: "AM",
    text: "/start — initiated bot",
    command: "/start",
    time: "2m ago",
    status: "delivered",
    chatType: "private",
  },
  {
    id: "2",
    user: "Julia Torres",
    username: "@jtorres",
    initials: "JT",
    text: "What are your features?",
    time: "5m ago",
    status: "delivered",
    chatType: "private",
  },
  {
    id: "3",
    user: "Dev Group",
    username: "group",
    initials: "DG",
    text: "/status — requested status",
    command: "/status",
    time: "8m ago",
    status: "delivered",
    chatType: "group",
  },
  {
    id: "4",
    user: "Mark Lee",
    username: "@marklee",
    initials: "ML",
    text: "/help",
    command: "/help",
    time: "12m ago",
    status: "pending",
    chatType: "private",
  },
  {
    id: "5",
    user: "Spam Bot",
    username: "@spamx",
    initials: "SB",
    text: "Buy now click here!!!",
    time: "15m ago",
    status: "blocked",
    chatType: "private",
  },
  {
    id: "6",
    user: "Sarah Kim",
    username: "@skim",
    initials: "SK",
    text: "/info — account info",
    command: "/info",
    time: "20m ago",
    status: "failed",
    chatType: "private",
  },
];

const statusVariant: Record<MessageStatus, "default" | "secondary" | "destructive" | "outline"> = {
  delivered: "default",
  pending: "secondary",
  failed: "destructive",
  blocked: "outline",
};

const statusLabel: Record<MessageStatus, string> = {
  delivered: "Delivered",
  pending: "Pending",
  failed: "Failed",
  blocked: "Blocked",
};

export function RecentMessagesTable() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold">Recent Messages</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-6">User</TableHead>
              <TableHead className="hidden sm:table-cell">Message</TableHead>
              <TableHead className="hidden md:table-cell">Chat</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden sm:table-cell">Time</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {messages.map((msg) => (
              <TableRow key={msg.id}>
                <TableCell className="pl-6">
                  <div className="flex items-center gap-2.5">
                    <Avatar className="h-7 w-7">
                      <AvatarFallback className="text-[10px] font-semibold">
                        {msg.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="text-xs font-medium leading-none truncate">{msg.user}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{msg.username}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="hidden sm:table-cell max-w-[200px]">
                  <p className="text-xs text-muted-foreground truncate">
                    {msg.command ? (
                      <code className="rounded bg-muted px-1 py-0.5 text-[10px] font-mono mr-1">
                        {msg.command}
                      </code>
                    ) : null}
                    {msg.text.replace(msg.command ?? "", "").trim()}
                  </p>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <Badge variant="outline" className="text-[10px] capitalize">
                    {msg.chatType}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={statusVariant[msg.status]}
                    className="text-[10px]"
                  >
                    {statusLabel[msg.status]}
                  </Badge>
                </TableCell>
                <TableCell className="hidden sm:table-cell text-xs text-muted-foreground">
                  {msg.time}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-7 w-7">
                        <MoreHorizontal className="h-3.5 w-3.5" />
                        <span className="sr-only">Actions</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="text-xs">
                      <DropdownMenuItem className="gap-2 text-xs">
                        <Eye className="h-3.5 w-3.5" />
                        View conversation
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="gap-2 text-xs">
                        <MessageSquareOff className="h-3.5 w-3.5" />
                        Mute user
                      </DropdownMenuItem>
                      <DropdownMenuItem className="gap-2 text-xs text-destructive focus:text-destructive">
                        <Ban className="h-3.5 w-3.5" />
                        Ban user
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
