import { useState, useEffect } from 'react';
import { TableOfContentsEntry } from '@/types/api';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Filter, X } from 'lucide-react';

interface SectionFilterProps {
  selectedSections: string[];
  onSectionsChange: (sections: string[]) => void;
}

export function SectionFilter({ selectedSections, onSectionsChange }: SectionFilterProps) {
  const [sections, setSections] = useState<TableOfContentsEntry[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    fetch('/table_of_contents.json')
      .then((res) => res.json())
      .then((data) => setSections(data))
      .catch((err) => console.error('Failed to load table of contents:', err));
  }, []);

  const toggleSection = (section: string) => {
    if (selectedSections.includes(section)) {
      onSectionsChange(selectedSections.filter((s) => s !== section));
    } else {
      onSectionsChange([...selectedSections, section]);
    }
  };

  const clearAll = () => {
    onSectionsChange([]);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
        >
          <Filter className="h-4 w-4" />
          Sections
          {selectedSections.length > 0 && (
            <span className="ml-1 rounded-full bg-accent px-2 py-0.5 text-xs text-accent-foreground">
              {selectedSections.length}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4" align="end">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Filter by Section</h3>
            {selectedSections.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAll}
                className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
              >
                <X className="mr-1 h-3 w-3" />
                Clear
              </Button>
            )}
          </div>
          <div className="max-h-[400px] space-y-3 overflow-y-auto pr-2">
            {sections.map((entry) => (
              <div key={entry.section} className="flex items-start gap-3">
                <Checkbox
                  id={entry.section}
                  checked={selectedSections.includes(entry.section)}
                  onCheckedChange={() => toggleSection(entry.section)}
                />
                <Label
                  htmlFor={entry.section}
                  className="flex-1 cursor-pointer text-sm leading-tight"
                >
                  {entry.section}
                  <span className="ml-2 text-xs text-muted-foreground">
                    (p. {entry.page})
                  </span>
                </Label>
              </div>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
