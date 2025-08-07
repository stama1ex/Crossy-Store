'use client';

import React, { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Title } from './title';
import { FilterCheckbox } from './filter-checkbox';
import { Input } from '../ui/input';
import { RangeSlider } from './range-slider';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Label } from '@radix-ui/react-label';
import { cn } from '@/lib/utils';
import { useFilterStore } from '@/store/filters';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../ui/accordion';

interface Props {
  className?: string;
}

export const Filters: React.FC<Props> = ({ className }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const colors = useFilterStore((state) => state.colors);
  const setColors = useFilterStore((state) => state.setColors);
  const priceFrom = useFilterStore((state) => state.priceFrom);
  const priceTo = useFilterStore((state) => state.priceTo);
  const setPriceFrom = useFilterStore((state) => state.setPriceFrom);
  const setPriceTo = useFilterStore((state) => state.setPriceTo);
  const gender = useFilterStore((state) => state.gender);
  const setGender = useFilterStore((state) => state.setGender);

  // Function to update URL search params
  const updateSearchParams = () => {
    const params = new URLSearchParams(searchParams.toString());

    // Update colors
    if (colors.length > 0) {
      params.set('colors', colors.join(','));
    } else {
      params.delete('colors');
    }

    // Update price range
    params.set('priceFrom', priceFrom.toString());
    params.set('priceTo', priceTo.toString());

    // Update gender
    if (gender) {
      params.set('gender', gender.toUpperCase());
    } else {
      params.delete('gender');
    }

    // Push updated params to URL
    router.push(`/?${params.toString()}`, { scroll: false });
  };

  // Sync filter state with URL changes
  useEffect(() => {
    updateSearchParams();
  }, [colors, priceFrom, priceTo, gender]);

  // Initialize filter state from URL on mount
  useEffect(() => {
    const colorsParam = searchParams.get('colors')?.split(',') || [];
    const priceFromParam = Number(searchParams.get('priceFrom')) || 0;
    const priceToParam = Number(searchParams.get('priceTo')) || 300;
    const genderParam = searchParams.get('gender')?.toLowerCase() as
      | 'male'
      | 'female'
      | null;

    if (colorsParam.length > 0) {
      colorsParam.forEach((color) => {
        if (!colors.includes(color)) {
          setColors(color, true);
        }
      });
    }
    if (priceFrom !== priceFromParam) {
      setPriceFrom(priceFromParam);
    }
    if (priceTo !== priceToParam) {
      setPriceTo(priceToParam);
    }
    if (gender !== genderParam) {
      setGender(genderParam);
    }
  }, []);

  return (
    <div
      className={cn('w-full sm:sticky sm:top-30 sm:w-[250px] z-20', className)}
    >
      <div className="sm:hidden">
        <Accordion type="single" collapsible defaultValue="palette-color">
          <AccordionItem value="palette-color">
            <AccordionTrigger className="text-base font-semibold mx-5">
              Palette Color
            </AccordionTrigger>
            <AccordionContent>
              <div className="flex flex-col gap-3 select-none mx-5">
                <FilterCheckbox
                  text="Neutral"
                  value="NEUTRAL"
                  checked={colors.includes('NEUTRAL')}
                  onCheckedChange={(checked) =>
                    setColors('NEUTRAL', checked ?? false)
                  }
                />
                <FilterCheckbox
                  text="Any other"
                  value="OTHER"
                  checked={colors.includes('OTHER')}
                  onCheckedChange={(checked) =>
                    setColors('OTHER', checked ?? false)
                  }
                />
              </div>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="price">
            <AccordionTrigger className="text-base font-semibold mx-5">
              Price from & to
            </AccordionTrigger>
            <AccordionContent>
              <div className="flex gap-2 mb-4 mx-5">
                <Input
                  type="number"
                  placeholder="0"
                  min={0}
                  max={300}
                  value={priceFrom}
                  className="text-sm py-1"
                  onChange={(e) =>
                    setPriceFrom(
                      Math.min(Math.max(+e.target.value, 0), priceTo)
                    )
                  }
                />
                <Input
                  type="number"
                  placeholder="300"
                  min={0}
                  max={300}
                  value={priceTo}
                  className="text-sm py-1"
                  onChange={(e) =>
                    setPriceTo(
                      Math.max(Math.min(+e.target.value, 300), priceFrom)
                    )
                  }
                />
              </div>
              <RangeSlider
                min={0}
                max={300}
                step={10}
                value={[priceFrom, priceTo]}
                onValueChange={([from, to]) => {
                  setPriceFrom(from);
                  setPriceTo(to);
                }}
                className="mb-4"
              />
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="gender">
            <AccordionTrigger className="text-base font-semibold mx-5">
              Gender
            </AccordionTrigger>
            <AccordionContent>
              <div className="flex flex-col gap-3 select-none mx-5">
                <RadioGroup
                  value={gender ?? ''}
                  onValueChange={(value) =>
                    setGender(
                      value === ''
                        ? null
                        : (value.toLowerCase() as 'male' | 'female')
                    )
                  }
                >
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="male" id="r1" className="w-5 h-5" />
                    <Label htmlFor="r1" className="text-sm">
                      Male
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem
                      value="female"
                      id="r2"
                      className="w-5 h-5"
                    />
                    <Label htmlFor="r2" className="text-sm">
                      Female
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
      <div className="hidden sm:block">
        <Title
          text="Palette color"
          size="sm"
          className="mb-4 font-semibold text-lg"
        />
        <div className="flex flex-col gap-4 select-none">
          <FilterCheckbox
            text="Neutral"
            value="NEUTRAL"
            checked={colors.includes('NEUTRAL')}
            onCheckedChange={(checked) =>
              setColors('NEUTRAL', checked ?? false)
            }
          />
          <FilterCheckbox
            text="Any other"
            value="OTHER"
            checked={colors.includes('OTHER')}
            onCheckedChange={(checked) => setColors('OTHER', checked ?? false)}
          />
        </div>

        <div className="mt-5 border-y border-y-neutral-200 py-6">
          <Title
            text="Price from & to"
            size="sm"
            className="mb-4 font-semibold text-lg"
          />
          <div className="flex gap-3 mb-5">
            <Input
              type="number"
              placeholder="0"
              min={0}
              max={300}
              value={priceFrom}
              className="text-base py-2"
              onChange={(e) =>
                setPriceFrom(Math.min(Math.max(+e.target.value, 0), priceTo))
              }
            />
            <Input
              type="number"
              placeholder="300"
              min={0}
              max={300}
              value={priceTo}
              className="text-base py-2"
              onChange={(e) =>
                setPriceTo(Math.max(Math.min(+e.target.value, 300), priceFrom))
              }
            />
          </div>
          <RangeSlider
            min={0}
            max={300}
            step={10}
            value={[priceFrom, priceTo]}
            onValueChange={([from, to]) => {
              setPriceFrom(from);
              setPriceTo(to);
            }}
            className="mb-6"
          />
        </div>

        <Title text="Gender" size="sm" className="my-4 font-semibold text-lg" />
        <div className="flex flex-col gap-4 select-none">
          <RadioGroup
            value={gender ?? ''}
            onValueChange={(value) =>
              setGender(
                value === '' ? null : (value.toLowerCase() as 'male' | 'female')
              )
            }
          >
            <div className="flex items-center gap-3">
              <RadioGroupItem value="male" id="r1" className="w-6 h-6" />
              <Label htmlFor="r1" className="text-base">
                Male
              </Label>
            </div>
            <div className="flex items-center gap-3">
              <RadioGroupItem value="female" id="r2" className="w-6 h-6" />
              <Label htmlFor="r2" className="text-base">
                Female
              </Label>
            </div>
          </RadioGroup>
        </div>
      </div>
    </div>
  );
};
