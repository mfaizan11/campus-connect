import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { FilePenLine, Trash2 } from "lucide-react";

interface CrudTablePlaceholderProps {
  columns: string[];
  itemCount?: number;
  itemName?: string;
}

export function CrudTablePlaceholder({ columns, itemCount = 3, itemName = "item" }: CrudTablePlaceholderProps) {
  const data = Array.from({ length: itemCount }, (_, i) => 
    columns.reduce((acc, col, j) => {
      acc[col] = `Sample ${col} ${i + 1}`;
      return acc;
    }, {} as Record<string, string>)
  );

  return (
    <Table>
      <TableCaption>A list of {itemName}s. (Placeholder data)</TableCaption>
      <TableHeader>
        <TableRow>
          {columns.map((col) => (
            <TableHead key={col}>{col}</TableHead>
          ))}
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((row, rowIndex) => (
          <TableRow key={rowIndex}>
            {columns.map((col) => (
              <TableCell key={col}>{row[col]}</TableCell>
            ))}
            <TableCell className="text-right space-x-2">
              <Button variant="outline" size="icon" aria-label="Edit item">
                <FilePenLine className="h-4 w-4" />
              </Button>
              <Button variant="destructive" size="icon" aria-label="Delete item">
                <Trash2 className="h-4 w-4" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
