---
name: Component Request
about: Request a new built-in component
title: '[COMPONENT] '
labels: component, enhancement
assignees: ''
---

## Component Name

What should this component be called?

## Category

What category does this belong to?
- [ ] I/O
- [ ] LLM
- [ ] Tool
- [ ] Memory
- [ ] Logic
- [ ] Other: ___________

## Description

What does this component do?

## Inputs

List the component inputs:

- **input1** (type: string, required: true): Description
- **input2** (type: number, required: false): Description

## Outputs

List the component outputs:

- **output1** (type: string): Description
- **output2** (type: object): Description

## Configuration

What configuration options should this component have?

```typescript
interface MyComponentConfig {
  option1: string;
  option2?: number;
}
```

## Use Case

How would this component be used in a workflow?

```typescript
const graph = new Graph({
  nodes: [
    {
      id: 'my-component',
      type: 'my-component-type',
      data: {
        option1: 'value',
      },
    },
  ],
});
```

## External Dependencies

Does this require any external services or libraries?
- API keys needed?
- Third-party packages?
- Network access?

## Implementation Complexity

- [ ] Simple (few lines of code)
- [ ] Moderate (requires some logic)
- [ ] Complex (requires significant implementation)

## Similar Components

Are there similar components in:
- Langflow Python?
- LangChain.js?
- Other frameworks?

## Would you like to implement this?

- [ ] Yes, I'd like to implement this component
- [ ] No, but I can help test
- [ ] Just requesting

## Additional Context

Add any other context about the component here.

