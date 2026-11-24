---
title: "IAM Explained: Who Gets In, What They Touch"
summary: "A practical introduction to identity and access management: proving who someone is, deciding what they can do, and keeping those permissions safe as systems grow."
date: "November 24 2026"
draft: false
tags:
- security
- iam
- cloud
- beginners
---

Every digital system eventually has to answer two deceptively simple questions:

1. **Who is trying to get in?**
2. **What are they allowed to do once they are in?**

Identity and access management, usually shortened to **IAM**, is the set of people, rules, and tools that answers them. It is not just a login screen. IAM decides whether a new engineer can view production logs, whether a payment service can write to a database, whether a former employee still has access, and whether an administrator can change the rules themselves.

At its best, IAM lets the right people and software do their work without making everything else available by default.

## Authentication and authorization are different jobs

These two terms are often used together, but they do different things.

- **Authentication** proves an identity: *Are you really Shravani?*
- **Authorization** decides what that identity may do: *May Shravani read this customer record or deploy this service?*

Signing in with a password, a passkey, or a one-time code is authentication. Seeing an "Edit post" button after you sign in is authorization.

```text
Sign in → prove identity → check permissions → allow or deny the action
```

You need both. A perfectly secure sign-in flow does not help if every signed-in user can access every database. Equally, a carefully designed permission model cannot protect a system if an attacker can impersonate an administrator.

## The building blocks of IAM

Most IAM systems use the same few ideas, even when the screens and terminology look different.

### Identities

An **identity** is the thing asking for access. It can be a person, but it does not have to be.

- A human employee signing in to an internal dashboard
- A contractor uploading content to a website
- A service running in the cloud
- A scheduled job backing up a database
- A CI/CD pipeline deploying an application

The last three are often called **workload identities** or **machine identities**. They matter just as much as human accounts. Modern systems are full of software talking to other software, and each connection needs a way to prove who is making the request.

### Credentials

A credential is what an identity uses to prove itself. Common examples include passwords, passkeys, hardware keys, temporary tokens, and certificates.

Good IAM design prefers credentials that are hard to steal and short-lived when possible. A long-lived access key copied into a configuration file can quietly become a serious security problem. A short-lived token issued only when a workload starts leaves much less behind for an attacker to reuse.

### Policies and permissions

A **permission** describes one allowed action on one kind of resource. For example:

```text
Identity: blog-editor
Action:    publish
Resource: blog posts
```

A **policy** is the rule that groups those permissions together. In a cloud platform, a policy might say that the `image-processor` service may read files from one upload bucket and write thumbnails to a different bucket, but may not delete either one.

```text
image-processor
  ✓ read  uploads/*
  ✓ write thumbnails/*
  ✗ delete uploads/*
  ✗ read  customer-data/*
```

Policies are where IAM becomes concrete. They express not only *who* has access, but which **actions** they can take against which **resources**, sometimes under which conditions.

### Groups and roles

Giving permissions one person at a time works for a tiny system, then becomes difficult to reason about.

**Groups** collect people with a shared need, such as `designers`, `support`, or `finance`. Assigning a permission to the group means a new team member gets the right access when they join the group, rather than through a collection of individual exceptions.

**Roles** describe a job to be performed. An engineer might temporarily assume a `production-read-only` role while investigating an incident. A deployment pipeline might use a `release-deployer` role. The role carries the permissions; the person or workload uses it only when needed.

The language varies by product, but the useful pattern is consistent: connect permissions to a responsibility, rather than permanently attaching a sprawling list of permissions to an individual account.

## A simple example

Imagine a small product team with a blog, an analytics dashboard, and a production database.

| Identity | Needs to do | Should not do |
| --- | --- | --- |
| Writer | Draft and publish posts | Access production customer data |
| Support teammate | View support tickets | Deploy application code |
| On-call engineer | Read logs and restart services | Export every database table by default |
| Deployment pipeline | Deploy the approved release | Change billing settings |

The important detail is that each identity gets **enough** access for its real work, not access to everything adjacent to it. The deployment pipeline may be trusted to deploy code, but that does not mean it should be able to read employee documents or create new administrator accounts.

## The principle of least privilege

The central idea behind safe IAM is **least privilege**: give an identity the minimum access it needs, for the minimum time it needs it.

That does not mean making every developer file a ticket for every small task. It means being deliberate about the blast radius of a mistake or compromised account.

For example, compare these two approaches:

```text
Broad access:  "Developers can manage every cloud resource."
Focused access: "Developers can read application logs and manage their own preview environments."
```

The second version is easier to explain, audit, and reverse. It also limits the damage if someone makes a mistake, loses a credential, or leaves the company.

Least privilege gets even stronger when paired with **just-in-time access**. Rather than giving an engineer permanent production-admin access, a system can grant a time-limited elevated role during a real incident, then remove it automatically.

## Access is a lifecycle, not a one-time setup

Many access problems are not caused by a clever attacker. They are caused by ordinary change: someone joins a team, changes teams, goes on leave, or leaves the organisation.

A healthy IAM process follows that lifecycle:

```text
Joiner  → grant the right baseline access
Mover   → remove old access, add the new access
Leaver  → disable access promptly and revoke active sessions or keys
Review  → check that remaining access still makes sense
```

The "mover" step is easy to overlook. If someone moves from support to engineering, they may need a new set of permissions, but they should not necessarily keep every privilege from the old role forever.

Access reviews help catch this drift. A manager or system owner periodically asks, "Does this person or service still need this?" The goal is not paperwork; it is keeping real permissions aligned with real responsibilities.

## Common IAM mistakes

IAM can become complex, but the recurring mistakes are surprisingly familiar.

### Sharing accounts

If five people use one account, there is no reliable answer to who performed an action. Give people their own identities, then put shared permissions in groups or roles.

### Using administrator access for daily work

An admin account is valuable because it can change nearly everything. Use a lower-privilege account for normal work and elevate only when an administrative task actually requires it.

### Leaving secrets in code or configuration

Keys and tokens often end up in repositories, screenshots, or copied configuration files. Prefer managed secret storage and short-lived workload credentials. If a secret is accidentally exposed, rotate it quickly; removing the visible line is not enough.

### Treating service accounts as an afterthought

Applications, jobs, and pipelines need deliberate identities too. A service that can access every database because it was expedient to configure will be hard to secure later.

### Adding permissions without a path to remove them

Emergency access is sometimes necessary. The trouble starts when emergency permissions become permanent. Document why an exception exists, assign an owner, and review it regularly.

## A practical starting checklist

If you are improving a small application or team, start with the highest-leverage basics:

1. Turn on multi-factor authentication or passkeys for important accounts.
2. Give each person an individual account; avoid shared credentials.
3. Use groups or roles for common responsibilities.
4. Separate everyday accounts from administrator access.
5. Give services and CI/CD pipelines their own narrowly scoped identities.
6. Remove access promptly when people change roles or leave.
7. Review privileged access on a schedule.

You do not need a giant enterprise IAM programme to benefit from these practices. Even a personal project is safer when deployment credentials cannot read unrelated data, and a growing team is easier to manage when access follows clear roles instead of memory.

## The question behind every permission

IAM becomes much less abstract when you ask a plain-language question for every rule:

> **Who gets in, what can they touch, and why do they need it?**

If you can answer that clearly, you are already doing the most important IAM work. The policies, groups, roles, and tools are simply the way you make that answer consistent as your system grows.
