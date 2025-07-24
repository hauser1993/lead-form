# SelectWithAutocomplete Component

The `SelectWithAutocomplete` component enhances the standard Radix UI select with browser autocomplete functionality by including a hidden native select element.

## Usage

```tsx
import { 
  SelectWithAutocomplete, 
  SelectTrigger, 
  SelectContent, 
  SelectItem, 
  SelectValue 
} from '@/components/ui/select'

const countryOptions = [
  { value: 'usa', label: 'United States' },
  { value: 'canada', label: 'Canada' },
  { value: 'mexico', label: 'Mexico' },
  { value: 'uk', label: 'United Kingdom' },
]

function CountrySelect() {
  const [value, setValue] = useState('')

  return (
    <SelectWithAutocomplete
      name="country"
      autoComplete="country"
      value={value}
      onValueChange={setValue}
      options={countryOptions}
      placeholder="Select a country"
    >
      <SelectTrigger>
        <SelectValue placeholder="Select a country" />
      </SelectTrigger>
      <SelectContent>
        {countryOptions.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </SelectWithAutocomplete>
  )
}
```

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `children` | `React.ReactNode` | ✅ | The Radix select components (trigger, content, items) |
| `value` | `string` | ❌ | Current selected value |
| `onValueChange` | `(value: string) => void` | ❌ | Callback when value changes |
| `name` | `string` | ❌ | Name attribute for the hidden select (required for autocomplete) |
| `autoComplete` | `string` | ❌ | Autocomplete attribute (e.g., 'country', 'address-level1') |
| `options` | `Array<{value: string, label: string}>` | ✅ | Options for the hidden select |
| `placeholder` | `string` | ❌ | Placeholder text (default: "Select an option") |
| `className` | `string` | ❌ | Additional CSS classes |
| `disabled` | `boolean` | ❌ | Whether the select is disabled |

## How It Works

1. **Hidden Native Select**: A native `<select>` element is rendered with `opacity: 0` and `pointer-events: none`
2. **Autocomplete Integration**: The hidden select has the specified `name` and `autoComplete` attributes
3. **Value Synchronization**: Both the hidden and visible selects share the same value and update together
4. **Browser Compatibility**: Browsers can recognize and autocomplete the hidden select while users interact with the styled Radix select

## Common Autocomplete Values

- `country` - Country selection
- `address-level1` - State/Province
- `address-level2` - City
- `postal-code` - ZIP/Postal code
- `tel-country-code` - Country calling code
- `language` - Language preference

## Benefits

- ✅ Maintains beautiful Radix UI styling
- ✅ Enables browser autocomplete functionality
- ✅ Improves user experience with saved form data
- ✅ Accessible and keyboard-friendly
- ✅ Fully typed with TypeScript 