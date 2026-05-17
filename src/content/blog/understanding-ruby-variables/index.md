---
title: "Understanding Ruby Variables"
summary: "A friendly tour of Ruby's variable identifiers, sigils, and the four kinds of variable scope."
date: "May 15 2026"
draft: false
tags:
- ruby
- fundamentals
---

A variable is simply a name for a value. Variables are created and then values are assigned to them.

Here are some naming conventions for Ruby's variable identifiers.

- Ruby is a **case-sensitive** language. The keyword `end`, for example, is completely different from the keyword `END`.
- Ruby variable identifiers consist of **letters, numbers, and underscores**, but they may not begin with a number. This makes it easier for the interpreter to distinguish a literal number from a variable.
- Variables **may not begin with a capital letter**. If an identifier begins with a capital letter, it is considered to be a *constant* in Ruby.
- They may not include whitespace or non-printing characters.

The following are a few valid variables:

```ruby
i
x2
old_value
_internal          # Identifiers may begin with underscores
PI                 # Constant
```

By convention, multi-word variables that are not constants are written with underscores `like_this`, whereas multi-word constants are written `LIKETHIS` or `LIKE_THIS`.

> **Note:** Variable names should be meaningful. It's good practice to choose descriptive names for variables — your programs become much more readable.

## Ruby sigils

Variable identifiers can start with punctuation characters, also called **sigils**. A sigil is a symbol attached to an identifier. In Ruby, sigils denote variable *scope* — this is in contrast to Perl, where sigils denote *data type*. The Ruby variable sigils are `$` and `@`:

- `$` — **Global** variables are prefixed with a dollar sign.
- `@` — **Instance** variables are prefixed with a single at-sign, and **class** variables are prefixed with two at-signs (`@@`).
- `?` — As a helpful convention, methods that return Boolean values often have names that end with a question mark. For example, `is_empty?()` or `is_blank?()`.

## Scope of variables

Let's explore the four variables with different scopes. A **scope** is the range in which a variable can be referenced. When the name of a variable appears in a program anywhere other than the left-hand side of an assignment, it is a *variable reference expression* and evaluates to the value of the variable:

```ruby
one = 1.0     # This is an assignment
one           # This variable reference expression evaluates to 1.0
```

There are four kinds of variables in Ruby, and lexical rules govern their names:

1. **Local variables**
2. **Global variables**
3. **Instance variables**
4. **Class variables**

### Local variables

Variables whose name begins with an underscore or a lowercase letter are local variables. A local variable is valid only locally — inside a method, block, or module.

```ruby
gemstone = "ruby"
```

### Global variables

Variables that begin with `$` are global variables, visible throughout a Ruby program.

```ruby
$planet = "earth"
```

### Instance and class variables

Variables that begin with `@` and `@@` are instance and class variables, used in object-oriented programming.

```ruby
class Car
  @make             # instance variable
  @@wheels = 4      # class variable

  def initialize(make)
    @make = make
  end

  def self.wheels
    @@wheels
  end

  attr_accessor :make
end

civic = Car.new("Tiago")

# instance variable, called on the object
civic.make   #=> "Tiago"

# class variable, called on the class itself
Car.wheels   #=> 4
```

Apart from these regular variables, there are **environment** and **command-line** variables that are used while working with blocks and hashes.

There are **pseudo-variables** like `self`, `nil`, `true`, and `false`.

And finally, **predefined variables** like `$!`, `$@`, `$/`.

We'll talk more about them in the next blog.

Happy coding! :)
