import * as React from "react";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, Search, Phone, MessageCircle, FileText, ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";
import { Button } from "./button";
import { Input } from "./input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./dropdown-menu";

interface Column<T> {
  key: keyof T | string;
  header: string;
  render?: (item: T) => React.ReactNode;
  className?: string;
  mobileWidth?: string; // e.g., "w-[25%]"
  sortable?: boolean;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  searchable?: boolean;
  searchPlaceholder?: string;
  pagination?: boolean;
  pageSize?: number;
  onRowClick?: (item: T) => void;
  showActions?: boolean;
  onCall?: (item: T) => void;
  onChat?: (item: T) => void;
  onSummary?: (item: T) => void;
  emptyMessage?: string;
  className?: string;
  getPhoneNumber?: (item: T) => string | undefined;
}

type SortDirection = 'asc' | 'desc' | null;

interface SortState {
  key: string | null;
  direction: SortDirection;
}

export function DataTable<T extends { id: string }>({
  data,
  columns,
  searchable = true,
  searchPlaceholder = "Buscar...",
  pagination = true,
  pageSize = 10,
  onRowClick,
  showActions = true,
  onCall,
  onChat,
  onSummary,
  emptyMessage = "Nenhum registro encontrado",
  className,
  getPhoneNumber,
}: DataTableProps<T>) {
  const [search, setSearch] = React.useState("");
  const [currentPage, setCurrentPage] = React.useState(1);
  const [sort, setSort] = React.useState<SortState>({ key: null, direction: null });

  const getValue = (item: T, key: keyof T | string): any => {
    if (typeof key === 'string' && key.includes('.')) {
      return key.split('.').reduce((obj: any, k) => obj?.[k], item);
    }
    return item[key as keyof T];
  };

  const handleSort = (key: string) => {
    setSort((prev) => {
      if (prev.key !== key) {
        return { key, direction: 'asc' };
      }
      if (prev.direction === 'asc') {
        return { key, direction: 'desc' };
      }
      return { key: null, direction: null };
    });
  };

  const sortedData = React.useMemo(() => {
    if (!sort.key || !sort.direction) return data;
    
    return [...data].sort((a, b) => {
      const aVal = getValue(a, sort.key!);
      const bVal = getValue(b, sort.key!);
      
      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return sort.direction === 'asc' ? 1 : -1;
      if (bVal == null) return sort.direction === 'asc' ? -1 : 1;
      
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sort.direction === 'asc' 
          ? aVal.localeCompare(bVal, 'pt-BR') 
          : bVal.localeCompare(aVal, 'pt-BR');
      }
      
      if (aVal < bVal) return sort.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sort.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data, sort]);

  const filteredData = React.useMemo(() => {
    if (!search) return sortedData;
    return sortedData.filter((item) =>
      Object.values(item).some((value) =>
        String(value).toLowerCase().includes(search.toLowerCase())
      )
    );
  }, [sortedData, search]);

  const totalPages = Math.ceil(filteredData.length / pageSize);
  const paginatedData = pagination
    ? filteredData.slice((currentPage - 1) * pageSize, currentPage * pageSize)
    : filteredData;

  return (
    <div className={cn("space-y-4", className)}>
      {searchable && (
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder={searchPlaceholder}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="pl-9 ios-input"
          />
        </div>
      )}

      <div className="bg-card rounded-xl border border-border/20 overflow-hidden" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/20">
                {columns.map((column) => {
                  return (
                    <th
                      key={String(column.key)}
                      className={cn(
                        "px-2 py-2 text-left text-[10px] font-medium text-muted-foreground/50 uppercase tracking-wider",
                        column.mobileWidth,
                        "md:w-auto",
                        column.className
                      )}
                    >
                      {column.header}
                    </th>
                  );
                })}
                {showActions && (
                  <th className="px-2 py-2 text-left text-[10px] font-medium text-muted-foreground/50 uppercase tracking-wider w-[15%] md:w-auto">
                    Ações
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {paginatedData.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length + (showActions ? 1 : 0)}
                    className="px-2 py-6 text-center text-[11px] text-muted-foreground/70"
                  >
                    {emptyMessage}
                  </td>
                </tr>
              ) : (
                paginatedData.map((item, index) => (
                  <tr
                    key={item.id}
                    onClick={() => onRowClick?.(item)}
                    className={cn(
                      "border-b border-border/10 transition-colors hover:bg-secondary/20",
                      onRowClick && "cursor-pointer"
                    )}
                  >
                    {columns.map((column, colIndex) => (
                      <td
                        key={String(column.key)}
                        className={cn(
                          "px-2 py-2 text-[11px] truncate",
                          colIndex === 0 ? "font-medium text-foreground/80" : "text-muted-foreground/70",
                          column.className
                        )}
                      >
                        {column.render
                          ? column.render(item)
                          : getValue(item, column.key)}
                      </td>
                    ))}
                    {showActions && (
                      <td className="px-2 py-2">
                        <div className="flex items-center gap-0">
                          {onCall && (
                            (() => {
                              const phoneNumber = getPhoneNumber?.(item);
                              return phoneNumber ? (
                                <a
                                  href={`tel:${phoneNumber}`}
                                  className="p-1.5 hover:bg-primary/10 rounded-md transition-colors"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onCall(item);
                                  }}
                                  title="Ligar"
                                >
                                  <Phone className="w-3.5 h-3.5 text-primary/70 hover:text-primary" />
                                </a>
                              ) : (
                                <button
                                  className="p-1.5 hover:bg-primary/10 rounded-md transition-colors"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onCall(item);
                                  }}
                                  title="Ligar"
                                >
                                  <Phone className="w-3.5 h-3.5 text-primary/70 hover:text-primary" />
                                </button>
                              );
                            })()
                          )}
                          {onChat && (
                            <button
                              className="p-1.5 hover:bg-success/10 rounded-md transition-colors"
                              onClick={(e) => {
                                e.stopPropagation();
                                onChat(item);
                              }}
                              title="Abrir Chat"
                            >
                              <MessageCircle className="w-3.5 h-3.5 text-success/70 hover:text-success" />
                            </button>
                          )}
                          {onSummary && (
                            <button
                              className="p-1.5 hover:bg-muted rounded-md transition-colors"
                              onClick={(e) => {
                                e.stopPropagation();
                                onSummary(item);
                              }}
                              title="Resumo da Conversa"
                            >
                              <FileText className="w-3.5 h-3.5 text-muted-foreground/70 hover:text-foreground" />
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {pagination && totalPages > 1 && (
          <div className="flex items-center justify-between px-3 py-2 border-t border-border/30">
            <p className="text-[11px] text-muted-foreground/70">
              Mostrando {(currentPage - 1) * pageSize + 1} a{" "}
              {Math.min(currentPage * pageSize, filteredData.length)} de{" "}
              {filteredData.length}
            </p>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setCurrentPage(pageNum)}
                      className="w-8 h-8 p-0"
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
