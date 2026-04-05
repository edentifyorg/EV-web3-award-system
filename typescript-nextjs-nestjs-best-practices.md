# TypeScript + Next.js + Nest.js Best Practices

This document contains battle-tested best practices for building performant, maintainable web applications with TypeScript, Next.js (frontend), and Nest.js (backend).

## Concurrency and Async Programming Rules

**IMPORTANT**: This architecture uses **async/await** with proper patterns for both client and server.

### Architectural Boundary

There is a clear separation between layers:

- **Backend (Nest.js)** = **Services, Controllers, Repositories**
  - All business logic lives in Services
  - Controllers are thin - only handle HTTP concerns
  - Repositories handle data access
  - ❌ NO business logic in Controllers

- **Frontend (Next.js)** = **Server Components, Client Components, Server Actions**
  - Server Components for data fetching and static content
  - Client Components for interactivity
  - Server Actions for mutations
  - ❌ NO direct database access in components

**Golden Rule**: If it's business logic, it belongs in a Service (backend) or Server Action (frontend). If it's presentation, it belongs in a Component.

### Async/Await Best Practices

1. **Keep Services Pure**
   - Services should be stateless and handle business logic
   - Controllers delegate to services, never contain logic
   - Example:
   ```typescript
   // ✅ Good: Pure service method
   @Injectable()
   export class UserService {
       async validateCredentials(email: string, password: string): Promise<boolean> {
           const user = await this.userRepository.findByEmail(email);
           if (!user) return false;
           return this.hashService.compare(password, user.passwordHash);
       }
   }

   // ❌ Bad: Business logic in controller
   @Controller('auth')
   export class AuthController {
       @Post('login')
       async login(@Body() dto: LoginDto) {
           const user = await this.userRepository.findByEmail(dto.email);
           const isValid = await bcrypt.compare(dto.password, user.passwordHash);
           // NO - this belongs in a service
       }
   }
   ```

2. **Think in Layers, Not Endpoints**
   - Design data flow through layers
   - Every request should flow: Controller → Service → Repository
   - Every pipeline should read like a story: input → validation → business logic → persistence → response

3. **Use DTOs for Data Transfer**
   - Always use DTOs for request/response boundaries
   - Makes code type-safe and validatable
   - Enforces proper abstraction boundaries
   ```typescript
   // ✅ Good: Clean DTO
   export class CreateUserDto {
       @IsEmail()
       email: string;

       @IsString()
       @MinLength(8)
       password: string;
   }
   ```

4. **Dependency Injection Usage**
   - Only inject dependencies that are **needed** by that service
   - Avoid circular dependencies
   - Rule: Inject what you use, use what you inject
   ```typescript
   // ✅ Good: Clear dependencies
   @Injectable()
   export class UserService {
       constructor(
           private readonly userRepository: UserRepository,
           private readonly hashService: HashService,
       ) {}
   }
   ```

5. **Anti-Patterns to Avoid**
   - ❌ Business logic in Controllers (controllers should be thin)
   - ❌ Nested try/catch blocks (use exception filters)
   - ❌ Not handling errors properly (always use typed exceptions)
   - ❌ Ignoring async context - always await or return promises
   - ❌ Circular dependencies between services
   - ❌ Direct database access in Controllers or Components

6. **Nest.js + Next.js Integration**
   - Keep business logic in Nest.js services
   - Next.js calls Nest.js API or uses Server Actions
   - Use proper error handling across the boundary

   **Pattern 1: Server Component data fetching**
   ```typescript
   // Nest.js Service - Pure business logic
   @Injectable()
   export class UserService {
       async findAll(): Promise<User[]> {
           return this.userRepository.find({
               where: { isActive: true },
               order: { createdAt: 'DESC' },
           });
       }
   }

   // Nest.js Controller - Thin HTTP layer
   @Controller('users')
   export class UserController {
       constructor(private readonly userService: UserService) {}

       @Get()
       async findAll(): Promise<User[]> {
           return this.userService.findAll();
       }
   }

   // Next.js Server Component - Data fetching
   async function UserList() {
       const users = await fetch(`${API_URL}/users`, {
           next: { revalidate: 60 },
       }).then(r => r.json());

       return (
           <ul>
               {users.map(user => <li key={user.id}>{user.name}</li>)}
           </ul>
       );
   }
   ```

   **Pattern 2: Server Actions for mutations**
   ```typescript
   // Next.js Server Action
   'use server';

   export async function createUser(formData: FormData) {
       const email = formData.get('email') as string;
       const password = formData.get('password') as string;

       const response = await fetch(`${API_URL}/users`, {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({ email, password }),
       });

       if (!response.ok) {
           throw new Error('Failed to create user');
       }

       revalidatePath('/users');
       return response.json();
   }

   // Client Component using Server Action
   'use client';

   function CreateUserForm() {
       const [isPending, startTransition] = useTransition();

       async function handleSubmit(formData: FormData) {
           startTransition(async () => {
               await createUser(formData);
           });
       }

       return (
           <form action={handleSubmit}>
               <input name="email" type="email" required />
               <input name="password" type="password" required />
               <button type="submit" disabled={isPending}>
                   {isPending ? 'Creating...' : 'Create User'}
               </button>
           </form>
       );
   }
   ```

   **Pattern 3: Client-side state with hooks**
   ```typescript
   'use client';

   function SearchView() {
       const [query, setQuery] = useState('');
       const [results, setResults] = useState<Result[]>([]);
       const debouncedQuery = useDebounce(query, 300);

       useEffect(() => {
           if (!debouncedQuery) {
               setResults([]);
               return;
           }

           const controller = new AbortController();

           fetch(`${API_URL}/search?q=${debouncedQuery}`, {
               signal: controller.signal,
           })
               .then(r => r.json())
               .then(setResults)
               .catch(err => {
                   if (err.name !== 'AbortError') console.error(err);
               });

           return () => controller.abort();
       }, [debouncedQuery]);

       return (
           <div>
               <input value={query} onChange={e => setQuery(e.target.value)} />
               <ul>
                   {results.map(r => <li key={r.id}>{r.title}</li>)}
               </ul>
           </div>
       );
   }
   ```

7. **Architecture Pattern**
   ```
   Request (what triggers data)
     ↓
   Validation (DTOs, Guards)
     ↓
   Business Logic (Services)
     ↓
   Persistence (Repositories)
     ↓
   Response (transformed data)
   ```

### When to Use Each Pattern
- ✅ Server Components: Static content, SEO-critical pages, data fetching
- ✅ Client Components: Interactivity, forms, real-time updates
- ✅ Server Actions: Form submissions, mutations, revalidation
- ✅ API Routes: Webhooks, third-party integrations
- ✅ Nest.js Services: All business logic, validation, data processing

## Next.js Component Lifecycle Rules

**CRITICAL**: Misusing `useEffect` causes duplicate API calls, flickering UIs, and race conditions.

### The Golden Rules
1. **Prefer Server Components for data fetching** - no useEffect needed
2. **Use Server Actions for mutations** - no manual fetch in useEffect
3. **Use `useEffect` only for client-side effects** - DOM manipulation, subscriptions, timers

### Key Principles

1. **Server Components Are NOT Client Components**
   - Server Components run on the server, once per request
   - Client Components can re-render multiple times
   - Use Server Components by default, Client only when needed
   - Never assume Client Component renders only once

2. **Prefer Server-Side Data Fetching**
   - Server Components can fetch data directly
   - No loading states, no useEffect, no race conditions
   - Automatic request deduplication

   ```typescript
   // ✅ Good: Server Component data fetching
   async function UserList() {
       const users = await userService.findAll();
       return <ul>{users.map(u => <li key={u.id}>{u.name}</li>)}</ul>;
   }

   // ❌ Bad: Client-side fetching when server would work
   'use client';
   function UserList() {
       const [users, setUsers] = useState([]);
       useEffect(() => {
           fetch('/api/users').then(r => r.json()).then(setUsers);
       }, []);
       return <ul>{users.map(u => <li key={u.id}>{u.name}</li>)}</ul>;
   }
   ```

3. **Use Dependency Arrays Correctly**
   - Effect re-runs when dependencies change
   - Missing dependencies cause stale closures
   - Extra dependencies cause unnecessary re-runs

   ```typescript
   // ✅ Good: Correct dependencies with cleanup
   useEffect(() => {
       const controller = new AbortController();

       fetch(`/api/users/${userId}`, { signal: controller.signal })
           .then(r => r.json())
           .then(setUser)
           .catch(err => {
               if (err.name !== 'AbortError') console.error(err);
           });

       return () => controller.abort();
   }, [userId]);

   // ❌ Bad: Missing dependency
   useEffect(() => {
       fetch(`/api/users/${userId}`).then(r => r.json()).then(setUser);
   }, []); // userId is missing!
   ```

4. **When `useEffect` IS Appropriate**
   - ✅ Setting up WebSocket connections
   - ✅ Setting up event listeners (resize, scroll)
   - ✅ Third-party library initialization
   - ✅ Analytics/logging events
   - ✅ Synchronization with browser APIs

   ```typescript
   useEffect(() => {
       analytics.log('Component mounted');
   }, []);

   useEffect(() => {
       const handleResize = () => setWidth(window.innerWidth);
       window.addEventListener('resize', handleResize);
       return () => window.removeEventListener('resize', handleResize);
   }, []);
   ```

5. **The N+1 Problem in Lists**
   - Never fetch data per item in a list
   - Fetch all data at the parent level
   - Use batch queries on the backend

   ```typescript
   // ❌ Bad: Each item fetches its own data
   function UserList({ userIds }: Props) {
       return userIds.map(id => <UserRow key={id} userId={id} />);
   }

   function UserRow({ userId }: Props) {
       const [user, setUser] = useState(null);
       useEffect(() => {
           fetch(`/api/users/${userId}`).then(r => r.json()).then(setUser);
       }, [userId]); // N API calls!
   }

   // ✅ Good: Fetch all at parent level (Server Component)
   async function UserList({ userIds }: Props) {
       const users = await userService.findByIds(userIds);
       return users.map(user => <UserRow key={user.id} user={user} />);
   }
   ```

6. **Use React Query / SWR for Client-Side Caching**
   ```typescript
   'use client';

   function ArticleList() {
       const { data: articles, isLoading, refetch } = useQuery({
           queryKey: ['articles'],
           queryFn: () => fetch('/api/articles').then(r => r.json()),
           staleTime: 60_000,
       });

       if (isLoading) return <Spinner />;

       return (
           <div>
               <button onClick={() => refetch()}>Refresh</button>
               <ul>
                   {articles?.map(article => (
                       <li key={article.id}>{article.title}</li>
                   ))}
               </ul>
           </div>
       );
   }
   ```

7. **Common Symptoms of Lifecycle Misuse**
   - Random data reloads every few seconds
   - API calls firing twice (especially in StrictMode)
   - List flickering
   - Components that won't stop re-rendering
   - State updates on unmounted components warnings
   - Hydration mismatches

8. **Components Are Ephemeral**
   - Treat components as snapshots, not pages
   - They can re-render at any time
   - State changes in parent components can trigger re-renders
   - Route changes can destroy and recreate components
   - Don't rely on component lifecycle for side effects

### Debugging Lifecycle Issues
Add these to understand component lifecycle behavior:
```typescript
useEffect(() => {
    console.log('✅ Mounted!');
    return () => console.log('❌ Unmounted!');
}, []);

useEffect(() => {
    console.log('🔄 Re-rendered!');
});
```

You'll be surprised how often these fire.

### Summary: Complete Architecture Pattern

**Layer Separation**:
```
┌─────────────────────────────────────────┐
│  Next.js Frontend                       │
│  ┌─────────────────────────────────┐   │
│  │ Server Components               │   │
│  │ - Data fetching                 │   │
│  │ - Static content                │   │
│  │ - SEO-critical pages            │   │
│  └─────────────────────────────────┘   │
│  ┌─────────────────────────────────┐   │
│  │ Client Components               │   │
│  │ - Interactivity                 │   │
│  │ - Forms                         │   │
│  │ - Real-time updates             │   │
│  └─────────────────────────────────┘   │
│  ┌─────────────────────────────────┐   │
│  │ Server Actions                  │   │
│  │ - Form submissions              │   │
│  │ - Mutations                     │   │
│  │ - Cache revalidation            │   │
│  └─────────────────────────────────┘   │
└──────────────┬──────────────────────────┘
               │ HTTP / API calls
               ↓
┌─────────────────────────────────────────┐
│  Nest.js Backend                        │
│  ┌─────────────────────────────────┐   │
│  │ Controllers (thin)              │   │
│  │ - HTTP concerns only            │   │
│  │ - Request/Response handling     │   │
│  │ - Validation via DTOs           │   │
│  └──────────────┬──────────────────┘   │
│                 │ delegates to          │
│                 ↓                       │
│  ┌─────────────────────────────────┐   │
│  │ Services (business logic)       │   │
│  │ - All business rules            │   │
│  │ - Data transformations          │   │
│  │ - Orchestration                 │   │
│  └──────────────┬──────────────────┘   │
│                 │ uses                  │
│                 ↓                       │
│  ┌─────────────────────────────────┐   │
│  │ Repositories (data access)      │   │
│  │ - Database queries              │   │
│  │ - External API calls            │   │
│  │ - Caching                       │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

**Key Takeaway**: Server Components handle data fetching, Client Components handle interactivity, Nest.js handles all business logic.

## Performance Optimization

### Next.js Performance Rules

1. **Use Server Components by Default**
   ```typescript
   // ✅ Good: Server Component (default)
   async function ProductPage({ params }: Props) {
       const product = await productService.findById(params.id);
       return <ProductDetails product={product} />;
   }

   // Only add 'use client' when needed
   'use client';
   function AddToCartButton({ productId }: Props) {
       const [isPending, startTransition] = useTransition();
       // Interactive logic here
   }
   ```

   **Rule**: Start with Server Components. Add `'use client'` only for interactivity.

2. **Use Streaming and Suspense for Better UX**
   ```typescript
   // ✅ Good: Streaming with Suspense
   async function ProductPage({ params }: Props) {
       return (
           <div>
               <Suspense fallback={<ProductSkeleton />}>
                   <ProductDetails id={params.id} />
               </Suspense>
               <Suspense fallback={<ReviewsSkeleton />}>
                   <ProductReviews id={params.id} />
               </Suspense>
           </div>
       );
   }
   ```

3. **Use `React.memo` for Expensive Client Components**
   ```typescript
   'use client';

   const ComplexChart = React.memo(function ComplexChart({ data }: Props) {
       return <Chart data={data} />;
   });

   // With custom comparison
   const ComplexChart = React.memo(
       function ComplexChart({ data }: Props) {
           return <Chart data={data} />;
       },
       (prevProps, nextProps) => prevProps.data.id === nextProps.data.id
   );
   ```

4. **Use `useMemo` and `useCallback` Appropriately**
   ```typescript
   'use client';

   function SearchResults({ items, filter }: Props) {
       // ✅ Good: Expensive computation memoized
       const filteredItems = useMemo(() => {
           return items.filter(item => item.name.includes(filter));
       }, [items, filter]);

       // ✅ Good: Callback passed to child memoized
       const handleSelect = useCallback((id: string) => {
           onSelect(id);
       }, [onSelect]);

       return filteredItems.map(item => (
           <Item key={item.id} item={item} onSelect={handleSelect} />
       ));
   }
   ```

5. **Use Virtualization for Long Lists**
   ```typescript
   'use client';

   import { FixedSizeList } from 'react-window';

   function VirtualizedList({ items }: Props) {
       return (
           <FixedSizeList
               height={400}
               itemCount={items.length}
               itemSize={50}
               width="100%"
           >
               {({ index, style }) => (
                   <div style={style}>
                       <ItemRow item={items[index]} />
                   </div>
               )}
           </FixedSizeList>
       );
   }
   ```

6. **Optimize Images with next/image**
   ```typescript
   import Image from 'next/image';

   // ✅ Good: Optimized image
   <Image
       src="/hero.jpg"
       alt="Hero"
       width={1200}
       height={600}
       priority // For above-the-fold images
   />

   // ❌ Bad: Unoptimized
   <img src="/hero.jpg" alt="Hero" />
   ```

7. **Use Route Segment Config for Caching**
   ```typescript
   // app/products/page.tsx
   export const revalidate = 3600; // Revalidate every hour

   // Or for dynamic routes
   export const dynamic = 'force-dynamic';
   ```

### Nest.js Performance Rules

1. **Use Proper Caching**
   ```typescript
   @Injectable()
   export class ProductService {
       constructor(
           private readonly cacheManager: Cache,
           private readonly productRepository: ProductRepository,
       ) {}

       async findById(id: string): Promise<Product> {
           const cacheKey = `product:${id}`;
           const cached = await this.cacheManager.get<Product>(cacheKey);

           if (cached) return cached;

           const product = await this.productRepository.findById(id);
           await this.cacheManager.set(cacheKey, product, 3600);

           return product;
       }
   }
   ```

2. **Use Database Indexing and Query Optimization**
   ```typescript
   // ✅ Good: Indexed query with select
   async findActiveUsers(): Promise<User[]> {
       return this.userRepository.find({
           where: { isActive: true },
           select: ['id', 'name', 'email'], // Only needed fields
           take: 100, // Pagination
       });
   }

   // ❌ Bad: Fetching everything
   async findActiveUsers(): Promise<User[]> {
       const allUsers = await this.userRepository.find();
       return allUsers.filter(u => u.isActive);
   }
   ```

3. **Use Batch Operations**
   ```typescript
   // ✅ Good: Batch query
   async findByIds(ids: string[]): Promise<User[]> {
       return this.userRepository.findByIds(ids);
   }

   // ❌ Bad: N+1 queries
   async findByIds(ids: string[]): Promise<User[]> {
       return Promise.all(ids.map(id => this.userRepository.findById(id)));
   }
   ```

4. **Use Compression and Response Optimization**
   ```typescript
   // main.ts
   import compression from 'compression';

   async function bootstrap() {
       const app = await NestFactory.create(AppModule);
       app.use(compression());
       await app.listen(3000);
   }
   ```

### Performance Checklist

Before shipping:
- [ ] Server Components used for data fetching
- [ ] Client Components only where interactivity needed
- [ ] Long lists use virtualization
- [ ] Expensive components use `React.memo`
- [ ] Images use `next/image`
- [ ] Proper caching configured (Redis, HTTP caching)
- [ ] Database queries optimized with indexes
- [ ] No N+1 query problems
- [ ] Profiled with browser DevTools and Lighthouse
- [ ] No heavy logic in `useEffect`

## Testing Best Practices

### Nest.js Testing

1. **Test Services, Not Controllers**
   ```typescript
   describe('UserService', () => {
       let service: UserService;
       let repository: MockType<UserRepository>;

       beforeEach(async () => {
           const module = await Test.createTestingModule({
               providers: [
                   UserService,
                   {
                       provide: UserRepository,
                       useFactory: mockRepository,
                   },
               ],
           }).compile();

           service = module.get(UserService);
           repository = module.get(UserRepository);
       });

       it('should find user by email', async () => {
           const mockUser = { id: '1', email: 'test@example.com' };
           repository.findOne.mockResolvedValue(mockUser);

           const result = await service.findByEmail('test@example.com');

           expect(result).toEqual(mockUser);
           expect(repository.findOne).toHaveBeenCalledWith({
               where: { email: 'test@example.com' },
           });
       });
   });
   ```

2. **Use Mock Factories**
   ```typescript
   export const mockRepository = <T>() => ({
       find: jest.fn(),
       findOne: jest.fn(),
       save: jest.fn(),
       delete: jest.fn(),
   });

   export const mockService = <T>() => ({
       findAll: jest.fn(),
       findById: jest.fn(),
       create: jest.fn(),
       update: jest.fn(),
       delete: jest.fn(),
   });
   ```

3. **Test Error Handling**
   ```typescript
   it('should throw NotFoundException when user not found', async () => {
       repository.findOne.mockResolvedValue(null);

       await expect(service.findById('nonexistent'))
           .rejects.toThrow(NotFoundException);
   });
   ```

### Next.js Testing

1. **Test Server Components**
   ```typescript
   import { render, screen } from '@testing-library/react';

   describe('UserList', () => {
       it('should render users', async () => {
           // Mock the fetch
           global.fetch = jest.fn().mockResolvedValue({
               json: () => Promise.resolve([
                   { id: '1', name: 'John' },
                   { id: '2', name: 'Jane' },
               ]),
           });

           const component = await UserList();
           render(component);

           expect(screen.getByText('John')).toBeInTheDocument();
           expect(screen.getByText('Jane')).toBeInTheDocument();
       });
   });
   ```

2. **Test Client Components with User Events**
   ```typescript
   import { render, screen, fireEvent } from '@testing-library/react';
   import userEvent from '@testing-library/user-event';

   describe('SearchForm', () => {
       it('should call onSearch with query', async () => {
           const onSearch = jest.fn();
           render(<SearchForm onSearch={onSearch} />);

           await userEvent.type(screen.getByRole('textbox'), 'test query');
           await userEvent.click(screen.getByRole('button', { name: /search/i }));

           expect(onSearch).toHaveBeenCalledWith('test query');
       });
   });
   ```

3. **Test Server Actions**
   ```typescript
   import { createUser } from './actions';

   describe('createUser action', () => {
       it('should create user and revalidate', async () => {
           global.fetch = jest.fn().mockResolvedValue({
               ok: true,
               json: () => Promise.resolve({ id: '1', email: 'test@example.com' }),
           });

           const formData = new FormData();
           formData.set('email', 'test@example.com');
           formData.set('password', 'password123');

           const result = await createUser(formData);

           expect(result).toEqual({ id: '1', email: 'test@example.com' });
       });
   });
   ```

---

**Remember**: These patterns are battle-tested and scale from small apps to large production codebases. The key is consistency and discipline in applying them throughout your project.
